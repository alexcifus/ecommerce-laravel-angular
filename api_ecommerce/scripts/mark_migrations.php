<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

$batch = 1;
$files = File::files(database_path('migrations'));

foreach ($files as $f) {
    $name = pathinfo($f->getFilename(), PATHINFO_FILENAME);
    DB::table('migrations')->insert(['migration' => $name, 'batch' => $batch]);
}

echo "OK\n";
