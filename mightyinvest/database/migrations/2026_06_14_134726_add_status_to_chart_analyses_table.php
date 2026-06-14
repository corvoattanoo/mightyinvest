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
        Schema::table('chart_analyses', function (Blueprint $table) {
            $table->string('status')->default('pending');
            $table->text('error_message')->nullable(); //if job failed store the error message
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chart_analyses', function (Blueprint $table) {
            $table->dropColumn(['status', 'error_message']);
        });
    }
};
