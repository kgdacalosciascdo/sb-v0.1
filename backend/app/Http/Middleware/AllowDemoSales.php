<?php

namespace App\Http\Middleware;

use App\Models\Company;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class AllowDemoSales
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! config('simplebiz.demo_sales_enabled')) {
            abort(404);
        }

        $companyId = config('simplebiz.demo_company_id');
        if (! is_string($companyId) || ! Str::isUuid($companyId)) {
            abort(503, 'Demo sales company is not configured.');
        }

        $company = Company::query()->whereKey($companyId)->where('is_active', true)->first();
        if (! $company) {
            abort(503, 'Demo sales company is unavailable.');
        }

        $request->attributes->set('company', $company);

        return $next($request);
    }
}
