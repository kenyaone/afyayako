<?php

/*
|--------------------------------------------------------------------------
| Create The Application
|--------------------------------------------------------------------------
|
| First, we need to get an application instance. This is pulled from the
| bootstrap file. The bootstrap file returns the Illuminate application
| instance that we can use to bind our start files to the container.
|
*/

$app = require __DIR__.'/../bootstrap/app.php';

/*
|--------------------------------------------------------------------------
| Run The Application
|--------------------------------------------------------------------------
|
| Once we have the application, we can handle the incoming request using
| the application's HTTP kernel. Then, we will send the response back
| to this client's browser allowing them to enjoy the creative
| and wonderful application we have prepared for them.
|
*/

$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);

$response = $kernel->handle(
    $request = \Illuminate\Http\Request::capture()
);

$response->send();

$kernel->terminate($request, $response);
