<?php

namespace App\Http\Middleware;

use App\Models\Company;
use App\Models\CompanyMembership;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

class EnsureCompanyContext
{
    public function handle(Request $request, Closure $next): Response
    {
        $companyId = $request->header('X-Company-Id');
        $user = $request->attributes->get('supabase_user');
        if (! is_string($companyId) || ! Str::isUuid($companyId)) {
            abort(422, 'X-Company-Id must contain a company UUID.');
        }

        $company = Company::query()->whereKey($companyId)->where('is_active', true)->first();
        $membership = $company ? CompanyMembership::query()->where('company_id', $company->id)->where('user_id', $user['id'] ?? null)->where('is_active', true)->first() : null;
        if (! $company || ! $membership) {
            abort(403, 'You do not have access to the requested company.');
        }

        $request->attributes->set('company', $company);
        $request->attributes->set('company_membership', $membership);

        return $next($request);
    }
}
