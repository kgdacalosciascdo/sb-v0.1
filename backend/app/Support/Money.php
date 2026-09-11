<?php

namespace App\Support;

use InvalidArgumentException;

final class Money
{
    public static function cents(mixed $amount): int
    {
        return self::scaledInteger($amount, 2);
    }

    public static function quantity(mixed $quantity): int
    {
        return self::scaledInteger($quantity, 4);
    }

    public static function basisPoints(mixed $percentage): int
    {
        return self::scaledInteger($percentage, 2);
    }

    public static function decimal(int $cents): string
    {
        $sign = $cents < 0 ? '-' : '';
        $cents = abs($cents);

        return $sign.intdiv($cents, 100).'.'.str_pad((string) ($cents % 100), 2, '0', STR_PAD_LEFT);
    }

    public static function divideAndRound(int $numerator, int $denominator): int
    {
        if ($denominator <= 0) {
            throw new InvalidArgumentException('The denominator must be greater than zero.');
        }

        return intdiv($numerator + intdiv($denominator, 2), $denominator);
    }

    private static function scaledInteger(mixed $value, int $scale): int
    {
        $value = trim((string) $value);
        if (! preg_match('/^\d+(?:\.\d+)?$/', $value)) {
            throw new InvalidArgumentException('A non-negative decimal value is required.');
        }
        [$whole, $fraction] = array_pad(explode('.', $value, 2), 2, '');

        return ((int) $whole * (10 ** $scale)) + (int) substr(str_pad($fraction, $scale, '0'), 0, $scale);
    }
}
