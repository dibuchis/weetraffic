<?php

namespace WeeTraffic\System;

use WeeTraffic\System\ORM\DB;
use WeeTraffic\System\User;

class User{

    public $cnx;
        
    public function __construct(){
    }

    public function init(){
    }

    public function findById($uid){
        
        $cnx = new DB();
        $db = $cnx->getDb();
        
        if($uid > 0){
                $userModel = $db->row("SELECT id, username, email  FROM user WHERE id = $uid");
                if($userModel){
                return $userModel;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }
    
    /**
     * Get the main template for the Board
     *
     * @return JSON var
     */
    public function login($username, $password){
        
        $cnx = new DB();
        $db = $cnx->getDb();

        $login = $db->row("SELECT id, username, password, prefer_layout FROM user WHERE username = '$username' AND password = '$password'");

        if($login){
            if(!isset($_SESSION)) 
            { 
                session_start();
            }
            $_SESSION['uid'] = $login['id'];
            $_SESSION['username'] = $login['username'];
            $_SESSION['prefer_layout'] = $login['prefer_layout'];
            // return print_r($_SESSION, true);
            return true;
        }else{
            return false;
        };
    }

}