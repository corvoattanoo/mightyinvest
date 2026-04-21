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
    Schema::table('social_sentiments', function (Blueprint $table) {
        $table->text('top_signal')->nullable()->after('sentiment');
    });
}
public function down(): void
{
    Schema::table('social_sentiments', function (Blueprint $table) {
        $table->dropColumn('top_signal');
    });
}
};
