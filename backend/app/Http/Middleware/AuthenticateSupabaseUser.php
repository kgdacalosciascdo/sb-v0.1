<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateSupabaseUser
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        $url = config('supabase.url');
        $key = config('supabase.publishable_key');
        if (! $token) {
            abort(401, 'A Supabase access token is required.');
        }
        if (! $url || ! $key) {
            abort(503, 'Supabase authentication is not configured.');
        }

        $response = Http::acceptJson()->timeout(5)->withHeaders(['apikey' => $key])->withToken($token)->get($url.'/auth/v1/user');
        if ($response->unauthorized() || $response->forbidden()) {
            abort(401, 'The Supabase access token is invalid or expired.');
        }
        if (! $response->successful() || ! is_string($response->json('id'))) {
            abort(503, 'Supabase authentication could not be verified.');
        }

        $request->attributes->set('supabase_user', ['id' => $response->json('id'), 'email' => $response->json('email')]);

        return $next($request);
    }
}
