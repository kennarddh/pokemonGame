<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class AbilityModel extends CI_Model {
    public function get_all()
    {
        $this->db->select("*");
        $this->db->from("ability");
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
        $this->db->from("ability");
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

    public function get_by_search($search)
    {
        $this->db->select("*");
        $this->db->from("ability");
        $this->db->like('name', $search, 'both');
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
}