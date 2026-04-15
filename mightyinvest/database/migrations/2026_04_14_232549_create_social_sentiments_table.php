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
        Schema::create('social_sentiments', function (Blueprint $table) {
            $table->id();
            $table->string('ticker', 10);
            $table->string('source'); 
            $table->integer('score')->default(50);
            $table->string('sentiment')->default('neutral');
            $table->integer('post_count')->default(0);
            $table->float('avg_engagement')->default(0);
            $table->timestamps();

            $table->unique(['ticker', 'source']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('social_sentiments');
    }
};
