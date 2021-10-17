<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class BattleHistoryModel extends CI_Model {
    public function get_all()
    {
        $this->db->select("*");
        $this->db->from("battle_history");
        $query = $this->db->get();
        if ($query->num_rows() > 0)
        {
            return $query->result();
        }
        else
        {
            return "";
        }
    }

    public function get_by_id($id)
    {
        $this->db->select("*");
        $this->db->from("battle_history");
        $this->db->where("id", $id);
        $query = $this->db->get();
        if ($query->num_rows() > 0)
        {
            return $query->row();
        }
        else
        {
            return "";
        }
    }

    public function create($data)
    {
        $query = $this->db->insert("battle_history", $data);
        return $query;
    }
}