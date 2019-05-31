<?php

namespace WeeTraffic\System;

use WeeTraffic\System\ORM\DB;

class App{

    public $cnx;
    
    const APP_NAME = "Tablero de Tráfico Semanal";
    const APP_COPYRIGHT = "WeeTraffic copyright® 2019";
    
    public function __construct(){
    }

    public function init(){
    }

    /**
     * Get the session status from user
     *
     * @return USER
     */
    public function authControl(){
        if(isset($_SESSION['uid'])){
            $uid = $_SESSION['uid'];
            $user = new User();
            $user->findById($uid);
            return $user;
        }else{
            return false;
        }
    }
    
    /**
     * Get the main template for the Board
     *
     * @return JSON var
     */
    public function loadData($type = 'week', $isName = null, $checkSession = true){
        
        $cnx = new DB();
        $db = $cnx->getDb();
        $name = null;

        if(!isset($_SESSION)) 
        { 
            session_start();
        }

        if($isName){
            $name = self::getPrefix($type) . $isName;
        }else{
            $name = self::getPrefix($type) . self::getWeek();
        }
        
        if(isset($_SESSION["prefer_layout"]) && $checkSession){
            $name = self::getPrefix($_SESSION["prefer_layout"]) . self::getWeek();
        }
        
        $exist = $db->row("SELECT name, data FROM traffic_data WHERE name = '" . $name . "'");

        if($exist){
            return str_replace(', "expanded":false', '', $exist["data"]);
        }

        $template = $db->row("SELECT params FROM options WHERE name = '" . $type . "_layout'");

        return $template["params"];
    }

    /**
     * Get the main template for the Board
     *
     * @return JSON var
     */
    public function getLayout($type = "week"){
        
        $cnx = new DB();
        $db = $cnx->getDb();

        $layout = $type . "_layout";

        $template = $db->row("SELECT params FROM options WHERE name = '$layout'");

        return $template["params"];
    }


    /**
     * Get the current week to work with it
     *
     * return string
     */
    public function getWeek(){
        
        $day = date('w');
        $week_start = date('Y-m-d', strtotime('-'.$day.' days'));
        //$week_end = date('m-d-Y', strtotime('+'.(6-$day).' days'));
        //$name = str_replace('-','',$week_start);
        return $week_start;
        
    }


    /**
     * Get type prefix
     *
     * return string
     */
    public function getPrefix($type){
        
        if($type == 'week'){
            return "we_";
        }

        if($type == 'project'){
            return "pj_";
        }
        
    }
}