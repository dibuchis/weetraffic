<?php

require __DIR__ . '../../../vendor/autoload.php';

use WeeTraffic\Controllers\DiagramController;
use WeeTraffic\System\App;
use WeeTraffic\System\User;

if(isset($_GET) || isset($_POST) ){
    
    $fn = $_REQUEST["fn"];
    
    $app = new App();
    $diagramController = new DiagramController();
    
    /*
    * SaveDiagram factory object
    * 
    * @data JSON
    * return Bolean
    *
    */
    if($fn == 'saveDiagram'){

        if($_REQUEST["data"]){
            
            $name = "";
            $type = "week";

            if($_REQUEST["name"]){
                $name = $_REQUEST["name"];
            }else{
                $name = $app->getWeek();
            }
            if($_REQUEST["type"]){
                $type = $_REQUEST["type"];
            }
            
            if($diagramController->saveDiagram($_REQUEST["data"], $name, $type )){

            }
        }else{
            echo "Data required.";
        }

    }

    /*
    * NewDiagram factory object
    * 
    * @data JSON
    * return Layout
    *
    */
    if($fn == 'newDiagram'){
        if(isset($_GET["type"])){
            echo $app->getLayout($_GET["type"]);
        }else{
            echo $app->getLayout();
        }
    }

    /*
    * Login factory object
    * 
    * @data $_POST
    * return USER instance
    *
    */
    if($fn == 'login'){
        $userSession = new User();
        if(isset($_POST["username"]) && isset($_POST["password"])){
            $login = $userSession->login($_REQUEST["username"], $_REQUEST["password"]);
            echo $login;
        }else{
            echo false;
        }
    }

    
    /*
    * Logout factory object
    * 
    * just try to logout
    *
    */
    if($fn == 'logout'){
        if(!isset($_SESSION)) 
        { 
            session_start();
        }
        session_unset(); 
        $flag = session_destroy();

        echo $flag;
    }

    /*
    * NewDiagram factory object
    * 
    * @data $_SESSION
    * return string
    *
    */
    if($fn == 'userLayout'){
        if(!isset($_SESSION)) 
        { 
            session_start();
        }
        if(isset($_SESSION["prefer_layout"])){
            echo $_SESSION["prefer_layout"];
        }else{
            echo "week";
        }
    }

    /*
    * NewDiagram factory object
    * 
    * @data JSON
    * return Layout
    *
    */
    if($fn == 'loadData'){
        echo $app->loadData($_GET["type"], null, false);
    }
}