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
            $table->string('name'); // Portfolio name
            $table->decimal('purchase_price', 10, 2); // Price at which the stock was bought
            $table->string('currency', 3)->default('USD'); // Currency of the portfolio
            $table->string('description', 255); // Description of the portfolio
            $table->boolean('is_active')->default(true); // aktif/pasif
            $table->timestamps();
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
