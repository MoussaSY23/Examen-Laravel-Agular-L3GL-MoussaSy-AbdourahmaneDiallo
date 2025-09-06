<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);
        
        $middleware->trustProxies(at: [
            '127.0.0.1',
            'localhost',
            '127.0.0.1:8000',
            'localhost:8000',
            '127.0.0.1:4200',
            'localhost:4200',
        ]);
        
        $middleware->web(\Illuminate\Http\Middleware\HandleCors::class);
        $middleware->api(\Illuminate\Http\Middleware\HandleCors::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
