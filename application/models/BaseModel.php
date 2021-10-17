<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class BaseModel extends CI_Model {
    public function get_all()
    {
        $this->db->select("*");
        $this->db->from("base");
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
        $this->db->from("base");
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

    public function get_ability_by_pokemon_id($id)
    {
        $this->db->select("*");
        $this->db->from("base_ability");
        $this->db->join("ability", "ability.id = base_ability.ability_id");
        $this->db->where("base_ability.base_id", $id);
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

    public function get_by_search($search)
    {
        $this->db->select("*");
        $this->db->from("base");
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

    public function create($data)
    {
        $query = $this->db->insert("base", $data);
        return $query;
    }
}