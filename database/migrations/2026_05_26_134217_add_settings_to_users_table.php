<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {

            $table->string('phone')->nullable();
            $table->string('job_title')->nullable();

            $table->string('avatar')->nullable();

            $table->boolean('two_factor_enabled')->default(false);

            $table->json('notification_preferences')->nullable();

            $table->json('privacy')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {

            $table->dropColumn([
                'phone',
                'job_title',
                'avatar',
                'two_factor_enabled',
                'notification_preferences',
                'privacy',
            ]);
        });
    }
};