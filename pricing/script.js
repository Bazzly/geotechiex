document.getElementById('request').addEventListener('input', function() {
    const text = this.value.trim();
    const words = text ? text.split(/\s+/) : [];
    document.getElementById('word-count').textContent = `${words.length}/50 words`;
    
    // Optional: Add warning class when approaching limit
    const wordCountElement = document.getElementById('word-count');
    if (words.length > 45) {
        wordCountElement.classList.add('text-orange-500');
        wordCountElement.classList.remove('text-gray-500');
    } else {
        wordCountElement.classList.add('text-gray-500');
        wordCountElement.classList.remove('text-orange-500');
    }
});