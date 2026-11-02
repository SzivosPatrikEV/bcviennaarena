<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$path = preg_replace('#^/api#', '', $path);
try {
    if ($path === '/events' && $method === 'GET') {
        $stmt = db()->query('SELECT * FROM events WHERE published = 1 ORDER BY `date`, startTime');
        send_json(200, $stmt->fetchAll());
    }

    if ($path === '/admin/events' || preg_match('#^/admin/events/([a-f0-9-]+)$#i', $path, $m)) {
        require_admin();
        if ($path === '/admin/events' && $method === 'GET') {
            $stmt = db()->query('SELECT * FROM events ORDER BY `date`, startTime');
            send_json(200, $stmt->fetchAll());
        }
        if ($path === '/admin/events' && $method === 'POST') {
            $e = clean_event(request_json());
            $id = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x', random_int(0,65535),random_int(0,65535),random_int(0,65535),random_int(0,4095)+0x4000,random_int(0,16383)+0x8000,random_int(0,65535),random_int(0,65535),random_int(0,65535));
            $sql = 'INSERT INTO events (id,title,`date`,endDate,startTime,endTime,venue,category,artists,description,ticketUrl,imageUrl,published,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(3))';
            db()->prepare($sql)->execute([$id,$e['title'],$e['date'],$e['endDate'],$e['startTime'],$e['endTime'],$e['venue'],$e['category'],$e['artists'],$e['description'],$e['ticketUrl'],$e['imageUrl'],$e['published']]);
            $q = db()->prepare('SELECT * FROM events WHERE id=?'); $q->execute([$id]); send_json(201, $q->fetch());
        }
        if (isset($m[1]) && $method === 'PUT') {
            $e = clean_event(request_json());
            $sql = 'UPDATE events SET title=?,`date`=?,endDate=?,startTime=?,endTime=?,venue=?,category=?,artists=?,description=?,ticketUrl=?,imageUrl=?,published=?,updatedAt=NOW(3) WHERE id=?';
            $q = db()->prepare($sql); $q->execute([$e['title'],$e['date'],$e['endDate'],$e['startTime'],$e['endTime'],$e['venue'],$e['category'],$e['artists'],$e['description'],$e['ticketUrl'],$e['imageUrl'],$e['published'],$m[1]]);
            if (!$q->rowCount()) { $check=db()->prepare('SELECT id FROM events WHERE id=?'); $check->execute([$m[1]]); if (!$check->fetch()) send_json(404,['error'=>'Event not found.']); }
            $q=db()->prepare('SELECT * FROM events WHERE id=?'); $q->execute([$m[1]]); send_json(200,$q->fetch());
        }
        if (isset($m[1]) && $method === 'DELETE') {
            $q=db()->prepare('DELETE FROM events WHERE id=?'); $q->execute([$m[1]]);
            if (!$q->rowCount()) send_json(404,['error'=>'Event not found.']);
            send_json(200,['success'=>true]);
        }
    }

    if ($path === '/contact' && $method === 'POST') {
        $d = request_json();
        $lang = ($d['language'] ?? '') === 'en' ? 'en' : 'de';
        $name=trim((string)($d['name']??'')); $email=trim((string)($d['email']??''));
        $type=trim((string)($d['eventType']??'')); $message=trim((string)($d['message']??''));
        if ($name==='' || mb_strlen($name)>120 || !filter_var($email,FILTER_VALIDATE_EMAIL) || mb_strlen($email)>254 || $type==='' || mb_strlen($type)>120 || $message==='' || mb_strlen($message)>5000) send_json(400,['error'=>'Please check all fields and try again.']);
        $key=envv('RESEND_API_KEY'); $from=envv('RESEND_FROM'); $to=envv('CONTACT_RECIPIENT');
        if ($key==='' || $from==='' || $to==='') send_json(503,['error'=>'Email service is not configured.']);
        $subject = $lang==='en' ? 'New event enquiry — BC Vienna Arena' : 'Neue Eventanfrage — BC Vienna Arena';
        $body = "BC VIENNA ARENA — EVENT ENQUIRY\n\nName: {$name}\nEmail: {$email}\nEvent type: {$type}\n\nMessage:\n{$message}\n\nWebsite language: ".strtoupper($lang);
        $ch=curl_init('https://api.resend.com/emails');
        curl_setopt_array($ch,[CURLOPT_POST=>true,CURLOPT_RETURNTRANSFER=>true,CURLOPT_HTTPHEADER=>['Authorization: Bearer '.$key,'Content-Type: application/json'],CURLOPT_POSTFIELDS=>json_encode(['from'=>$from,'to'=>[$to],'reply_to'=>$email,'subject'=>$subject,'text'=>$body]),CURLOPT_TIMEOUT=>20]);
        $response=curl_exec($ch); $status=(int)curl_getinfo($ch,CURLINFO_HTTP_CODE); curl_close($ch);
        if ($response===false || $status<200 || $status>=300) send_json(502,['error'=>'The enquiry could not be sent. Please try again.']);
        send_json(200,['success'=>true]);
    }
    send_json(404, ['error'=>'Not found.']);
} catch (InvalidArgumentException $e) {
    send_json(400, ['error'=>$e->getMessage()]);
} catch (Throwable $e) {
    error_log('BC Vienna API error: '.$e->getMessage());
    send_json(500, ['error'=>'Server error. Check the PHP error log.']);
}
