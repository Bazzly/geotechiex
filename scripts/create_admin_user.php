<?php
/**
 * Script: scripts/create_admin_user.php
 * Creates or updates an admin user using api/config.php and api/db.php
 * Usage: php scripts/create_admin_user.php [username] [password]
 */

$username = $argv[1] ?? 'temp_admin';
$password = $argv[2] ?? 'TempPass123!';

chdir(__DIR__ . '/..');
require_once __DIR__ . '/../api/config.php';
require_once __DIR__ . '/../api/db.php';

try {
    $pdo = get_db();
} catch (Exception $e) {
    echo "Database connection failed: " . $e->getMessage() . PHP_EOL;
    exit(2);
}

try {
    // Check if user exists
    $stmt = $pdo->prepare('SELECT id FROM admin_users WHERE username = :username LIMIT 1');
    $stmt->execute([':username' => $username]);
    $row = $stmt->fetch();

    $hash = password_hash($password, PASSWORD_DEFAULT);

    if ($row) {
        $stmt = $pdo->prepare('UPDATE admin_users SET password_hash = :hash, active = 1 WHERE id = :id');
        $stmt->execute([':hash' => $hash, ':id' => $row['id']]);
        echo "Updated existing admin user '{$username}' (id={$row['id']}).\n";
    } else {
        $stmt = $pdo->prepare('INSERT INTO admin_users (username, password_hash, active, created_at) VALUES (:username, :hash, 1, NOW())');
        $stmt->execute([':username' => $username, ':hash' => $hash]);
        $id = $pdo->lastInsertId();
        echo "Created admin user '{$username}' (id={$id}).\n";
    }

    echo "Credentials:\nUsername: {$username}\nPassword: {$password}\n";
    echo "Now you can call admin_login to get a token. Example:\n";
    echo "curl -s -X POST -H 'Content-Type: application/json' -d '{\"action\":\"admin_login\",\"username\":\"{$username}\",\"password\":\"{$password}\"}' http://localhost:8000/api/index.php\n";

} catch (Exception $e) {
    echo "Failed to create admin user: " . $e->getMessage() . PHP_EOL;
    exit(3);
}
