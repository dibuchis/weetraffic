<?php
    
require __DIR__ . '/vendor/autoload.php';

session_start();

use WeeTraffic\System\App;
use WeeTraffic\Models\Team\Member;

$app = new App();
$member = new Member();
$loader = new Twig_Loader_Filesystem('layouts');
$twig = new Twig_Environment($loader);

$user = $app->authControl();

if(empty($user)){
    session_destroy();
    // LOGIN FORM
    echo $twig->render('login/loginForm.html');

}else{ 
    //START TEMPLATE
    echo $twig->render('header.html', ['name' => $app::APP_NAME, 'username' => $_SESSION['username']]);
    
    //MODALS
    echo $twig->render('modals/members.html', ['members' => $member->getMembers()]);
    
    //MAIN CONTENT
    echo $twig->render('content.html', ['content' => "", 'board_template' => $app->loadData($_SESSION['prefer_layout']) ]);
    
    //CLOSE TEMPLATE
    echo $twig->render('footer.html', ['copyright' => $app::APP_COPYRIGHT ]);
}