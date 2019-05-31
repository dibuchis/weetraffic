<?php

namespace WeeTraffic\System\ORM;

class DB {
    
    const DB_LOCALHOST = "localhost";
    const DB_NAME = "database";
    const DB_USER = "root";
    const DB_PASSWORD = "";
    
    public function __construct(){}

    public function getDb(){

        try{
        $db = \ParagonIE\EasyDB\Factory::create(
            "mysql:host=" . $this::DB_LOCALHOST . ";dbname=" . $this::DB_NAME . ";charset=utf8",
            $this::DB_USER,
            $this::DB_PASSWORD
        );
        }catch(PDOException $e){
            return $e;
        }

        return $db;

    }

}