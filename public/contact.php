<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
    exit;
}

function clean_header_field(string $value): string {
    return trim(str_replace(["\r", "\n"], '', $value));
}

$name = clean_header_field($_POST['name'] ?? '');
$email = clean_header_field($_POST['email'] ?? '');
$subject = clean_header_field($_POST['subject'] ?? 'Question sur un produit');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '' || $message === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Merci de remplir tous les champs requis.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Adresse email invalide.']);
    exit;
}

$to = 'jardin-secret@mexiale.com';
$emailSubject = "[Jardin Secret] $subject — $name";

$body = "Nouveau message depuis le formulaire de contact du site Jardin Secret\n\n";
$body .= "Nom : $name\n";
$body .= "Email : $email\n";
$body .= "Sujet : $subject\n\n";
$body .= "Message :\n$message\n";

// NOTE : adapter le domaine de l'expéditeur ("From") au nom de domaine réel
// une fois le site en ligne sur Hostinger, pour éviter que l'email parte en spam.
$headers = "From: Jardin Secret <no-reply@jardinsecret.ci>\r\n";
$headers .= "Reply-To: $name <$email>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = mail($to, $emailSubject, $body, $headers);

if ($sent) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => "L'envoi du message a échoué. Merci de réessayer ou de nous contacter par un autre moyen."]);
}
