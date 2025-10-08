<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Storage;
use Illuminate\Filesystem\FilesystemAdapter;
use League\Flysystem\Filesystem;
use League\Flysystem\AwsS3V3\AwsS3V3Adapter;
use League\Flysystem\AwsS3V3\PortableVisibilityConverter;
use League\Flysystem\Visibility;
use Aws\S3\S3Client;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Set UTF-8 as default encoding for proper Arabic/Unicode support
        mb_internal_encoding('UTF-8');
        mb_http_output('UTF-8');
        
        // Register S3 driver (supports MinIO)
        Storage::extend('s3', function ($app, $config) {
            $s3Config = [
                'credentials' => [
                    'key'    => $config['key'],
                    'secret' => $config['secret'],
                ],
                'region' => $config['region'],
                'version' => 'latest',
            ];

            // MinIO and custom S3-compatible endpoints
            if (isset($config['endpoint'])) {
                $s3Config['endpoint'] = $config['endpoint'];
            }

            // Required for MinIO path-style URLs
            if (isset($config['use_path_style_endpoint'])) {
                $s3Config['use_path_style_endpoint'] = $config['use_path_style_endpoint'];
            }

            $client = new S3Client($s3Config);
            
            // Create adapter with visibility converter for public files
            $adapter = new AwsS3V3Adapter(
                $client,
                $config['bucket'],
                $config['prefix'] ?? '',
                new PortableVisibilityConverter(Visibility::PUBLIC)
            );

            // Return FilesystemAdapter instead of raw Filesystem
            return new FilesystemAdapter(
                new Filesystem($adapter, ['visibility' => Visibility::PUBLIC]),
                $adapter,
                $config
            );
        });
    }
}
