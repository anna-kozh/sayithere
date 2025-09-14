---
layout: default
title: Say it here
---

<h1 class="text-3xl font-bold text-pink-600 mb-4">Say it here</h1>

<p class="mb-4 font-medium">Do you have something on your mind? Say it here...</p>

<textarea id="confession" rows="6" class="w-full border rounded p-2 mb-4" placeholder="What's on your mind?"></textarea>

<button onclick="sendConfession()" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Send my confession</button>

<div id="result" class="mt-6 hidden">
  <h2 class="font-bold mb-2">You said:</h2>
  <p id="user-confession" class="mb-4 whitespace-pre-wrap text-gray-700"></p>
  <h2 class="font-bold mb-2">Our reply...</h2>
  <p id="ai-response" class="whitespace-pre-wrap text-blue-700"></p>
</div>

<script src="/assets/js/confess.js"></script>
