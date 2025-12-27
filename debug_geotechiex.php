<?php
// TEMP DEBUG PAGE FOR geotechiex.php
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/geotechiex_errors.log');

// Show file path and size
$file = __DIR__ . '/geotechiex.php';
echo "<h2>Debugging geotechiex.php</h2>";
echo "<b>File:</b> $file<br>";
echo "<b>Size:</b> " . filesize($file) . " bytes<br>";

// Show first and last 30 lines
$lines = file($file);
$total = count($lines);
echo "<h3>First 30 lines:</h3><pre>";
echo htmlspecialchars(implode('', array_slice($lines, 0, 30)));
echo "</pre>";
echo "<h3>Last 30 lines:</h3><pre>";
echo htmlspecialchars(implode('', array_slice($lines, -30)));
echo "</pre>";

// Try to include the file and catch parse errors
try {
    include $file;
    echo "<b>Include succeeded.</b>";
} catch (Throwable $e) {
    echo "<b>Include failed:</b> " . $e->getMessage();
}

// Run PHP lint check
$output = shell_exec("php -l " . escapeshellarg($file));
echo "<h3>PHP Lint Output:</h3><pre>" . htmlspecialchars($output) . "</pre>";
?>
