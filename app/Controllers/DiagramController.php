<?php 

namespace WeeTraffic\Controllers;

use WeeTraffic\System\ORM\DB;
use WeeTraffic\System\App;

class DiagramController extends Controller{

    public $app;

    public function __construct(){
        $this::init();
    }

    public function init(){
        $this->app = new App();
    }

    /*
    * SaveDiagram function to save data to DB with the specific set of diagram
    *
    * @data JSON
    * return Bolean
    *
    */
    public function saveDiagram($data, $name = '', $type = 'week'){
        
        if($name == ""){
            return false;
        }

        if($type == "week"){
            $name = "we_" . $name;
        }
        
        if($type == "project"){
            $name = "pj_" . $name;
        }

        try{
            $cnx = new DB();
            $db = $cnx->getDb();

            $exist = $db->row("SELECT name FROM traffic_data WHERE name = '$name'");

            if($exist){
                $res = $db->update('traffic_data', [
                    'data' => $data
                ],[
                    'name' => $name
                ]);
            }else{
                $res = $db->insert('traffic_data', [
                    'name' => $name,
                    'data' => $data,
                    'type' => $type
                ]);
            }

            echo $res;

            if($res){
                return true;
            }else{
                return false;
            }
        }catch(Exception $e){
            return false;
        }
    }

}