<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => ['http://localhost:4200'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        'Content-Type',
        'X-Auth-Token',
        'Origin',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'X-XSRF-TOKEN',
        'X-CSRF-TOKEN',
        'X-Socket-Id'
    ],

    'exposed_headers' => [
        'Authorization',
        'X-CSRF-TOKEN',
        'X-Requested-With',
        'Content-Disposition'
    ],

    'max_age' => 60 * 60 * 24, // 24 hours

    'supports_credentials' => true,
];
