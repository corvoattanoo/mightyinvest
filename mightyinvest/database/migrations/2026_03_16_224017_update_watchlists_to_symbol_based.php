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
        Schema::table('watchlists', function (Blueprint $table) {
            // Drop existing unique constraint if it follows the default naming
            $table->dropUnique(['user_id', 'stock_id']);
            
            // Drop foreign key and column
            $table->dropForeign(['stock_id']);
            $table->dropColumn('stock_id');

            // Add symbol column
            $table->string('symbol', 10)->after('user_id');

            // Add new unique constraint
            $table->unique(['user_id', 'symbol']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('watchlists', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'symbol']);
            $table->dropColumn('symbol');

            $table->foreignId('stock_id')->after('user_id')->constrained()->onDelete('cascade');
            $table->unique(['user_id', 'stock_id']);
        });
    }
};
