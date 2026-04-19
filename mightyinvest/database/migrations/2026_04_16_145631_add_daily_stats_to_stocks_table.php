<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->decimal('percent_change', 8, 2)->default(0);
            $table->decimal('daily_high', 10, 2)->nullable();
            $table->decimal('daily_low', 10, 2)->nullable();
            $table->bigInteger('volume')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('stocks', function (Blueprint $table) {
            $table->dropColumn(['percent_change', 'daily_high', 'daily_low', 'volume']);
        });
    }
};
