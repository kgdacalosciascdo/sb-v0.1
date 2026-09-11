<?php

return [
    'demo_sales_enabled' => filter_var(env('DEMO_SALES_ENABLED', false), FILTER_VALIDATE_BOOL),
    'demo_company_id' => env('DEMO_COMPANY_ID'),
];
