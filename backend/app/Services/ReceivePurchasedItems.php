<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Company;
use App\Models\InventoryMovement;
use App\Models\Purchase;
use App\Models\PurchaseLine;
use App\Support\Money;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ReceivePurchasedItems
{
    public function receive(Company $company, Purchase $purchase, array $data, string $key): void
    {
        $hash = hash('sha256', json_encode($data, JSON_THROW_ON_ERROR));
        DB::transaction(function () use ($company, $purchase, $data, $key, $hash): void {
            Company::query()->whereKey($company->id)->lockForUpdate()->firstOrFail();
            $previous = AuditLog::query()->where('company_id', $company->id)->where('event_type', 'purchase.received')
                ->where('correlation_id', $key)->first();
            if ($previous) {
                abort_unless($previous->subject_id === $purchase->id && ($previous->metadata['hash'] ?? null) === $hash, 409, 'This key belongs to a different receipt.');

                return;
            }
            $lines = PurchaseLine::query()->where('purchase_id', $purchase->id)->get()->keyBy('id');
            if ($data['received_on'] < $purchase->purchase_date->toDateString()) {
                throw ValidationException::withMessages(['received_on' => 'Receiving date cannot precede the purchase.']);
            }
            foreach ($data['items'] as $item) {
                $line = $lines->get($item['line_id']);
                if (! $line) {
                    throw ValidationException::withMessages(['items' => 'A line does not belong to this purchase.']);
                }
                $this->apply($company, $line, Money::quantity($item['quantity']), $data['received_on']);
            }
            AuditLog::query()->create([
                'company_id' => $company->id, 'correlation_id' => $key,
                'event_type' => 'purchase.received', 'subject_type' => 'purchase', 'subject_id' => $purchase->id,
                'metadata' => ['hash' => $hash, ...$data], 'occurred_at' => now(),
            ]);
        }, 3);
    }

    public function apply(Company $company, PurchaseLine $line, int $quantity, string $date): void
    {
        $ordered = Money::quantity($line->quantity);
        $before = Money::quantity($line->received_quantity ?? $line->quantity);
        $after = $before + $quantity;
        if ($after > $ordered || $quantity <= 0) {
            throw ValidationException::withMessages(['items' => 'Each receipt quantity must be positive and within the outstanding quantity.']);
        }
        // Allocate cumulative net cost so rounding balances on the final receipt.
        $cost = Money::divideAndRound($line->net_cents * $after, $ordered)
            - Money::divideAndRound($line->net_cents * $before, $ordered);
        $amount = $this->quantityString($quantity);
        $use = $line->snapshot['intended_use'] ?? 'sale';
        if ($line->snapshot['track_inventory'] && $use !== 'administrative') {
            InventoryMovement::query()->create([
                'company_id' => $company->id, 'product_service_id' => $line->product_service_id,
                'purchase_line_id' => $line->id, 'quantity' => $amount, 'cost_cents' => $cost,
                'movement_date' => $date, 'direction' => 'in',
            ]);
        } else {
            DB::table('purchase_expense_movements')->insert([
                'id' => (string) Str::uuid(), 'company_id' => $company->id, 'purchase_line_id' => $line->id,
                'received_on' => $date, 'quantity' => $amount, 'cost_cents' => $cost, 'intended_use' => $use,
            ]);
        }
        $line->update(['received_quantity' => $this->quantityString($after)]);
    }

    private function quantityString(int $quantity): string
    {
        return sprintf('%d.%04d', intdiv($quantity, 10000), $quantity % 10000);
    }
}
