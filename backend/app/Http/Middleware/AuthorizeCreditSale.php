<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthorizeCreditSale
{
    private const ALLOWED_ROLES = ['owner', 'sales_manager', 'sales_user'];

    public function handle(Request $request, Closure $next): Response
    {
        if (! in_array($request->attributes->get('company_membership')?->role, self::ALLOWED_ROLES, true)) {
            abort(403, 'Your company role cannot post credit sales.');
        }

        return $next($request);
    }
}
