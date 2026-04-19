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
        Schema::create('portfolios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('stock_id')->constrained()->onDelete('cascade');
            $table->integer('quantity');
            $table->decimal('average_price', 12, 2)->default(0);
            $table->string('name'); // Portfolio name
            $table->string('currency', 3)->default('USD'); // Currency of the portfolio
            $table->string('description', 255)->nullable(); // Description of the portfolio
            $table->timestamps();
            $table->unique(['user_id', 'stock_id']); // Aynı stock 2 kere açılmasın
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('portfolios');
    }
};
