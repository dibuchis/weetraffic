<?php

namespace WeeTraffic\Models\Team;

use WeeTraffic\System\ORM\DB;

class Member{
    
    
    public $id;
    public $name;
    public $title;
    
    const DB_TABLE = 'member';
    
    public function __construct(){}
    
    public function getMembers(){
        
        $cnx = new DB();
        $db = $cnx->getDb();
        
        // $exist = $db->exists("SELECT * FROM " . $this::DB_TABLE);
        $rows = $db->safeQuery("SELECT * FROM " . $this::DB_TABLE);

        return $rows;
    }
    
    public function save(){
        
        // $this->id = $id;
        // $this->name = $name;
        // $this->title = $title;
        
        return "Auto acelerando";
    }

}