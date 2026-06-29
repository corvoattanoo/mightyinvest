<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS vector');
    
        Schema::create('stock_embeddings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_id')->constrained('stocks')->onDelete('cascade');
            $table->text('content');
            $table->timestamps();
        });

        DB::statement('ALTER TABLE stock_embeddings ADD COLUMN embedding vector(1536)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('stock_embeddings');
    }
};
