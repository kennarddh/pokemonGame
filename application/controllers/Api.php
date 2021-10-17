<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require_once BASEPATH . '../restserver/src/RestController.php';
require_once BASEPATH . '../restserver/src/Format.php';

use chriskacerguis\RestServer\RestController;

class Api extends RestController {

    function __construct()
    {
        // Construct the parent class
        parent::__construct();
        $this->load->model("BaseModel");
        $this->load->model("AbilityModel");
        $this->load->model("BattleHistoryModel");
    }

    public function pokemon_all_get()
    {
        $pokemon = $this->BaseModel->get_all();

        if (empty($pokemon))
        {
            $this->response(["status" => FALSE, "result" => null, "error" => "No Such Pokemon Found"], 404);
        }
        else
        {
            $this->response(["status" => TRUE, "result" => $pokemon, "error" => ""], 200);
        }
    }

    public function pokemon_get_by_id_get()
    {
        if (!empty($this->input->get("id")))
        {
            $id = $this->input->get("id");
        }
        else
        {
            $this->response(["status" => FALSE, "result" => null, "error" => "No Such Argument Id Passed"], 404);
        }

        $pokemon = $this->BaseModel->get_by_id($id);
        $pokemonAbility = $this->BaseModel->get_ability_by_pokemon_id($id);

        $pokemon->abilities = $pokemonAbility;

        if (empty($pokemon))
        {
            $this->response(["status" => FALSE, "result" => null, "error" => "No Such Pokemon Found"], 404);
        }
        else
        {
            $this->response(["status" => TRUE, "result" => $pokemon, "error" => ""], 200);
        }
    }

    public function pokemon_get_by_search_get()
    {
        if (!empty($this->input->get("query")))
        {
            $search = $this->input->get("query");
        }
        else
        {
            $this->response(["status" => FALSE, "result" => null, "error" => "No Such Argument Query Passed"], 404);
        }

        $pokemon = $this->BaseModel->get_by_search($search);

        if (empty($pokemon))
        {
            $this->response(["status" => FALSE, "result" => null, "error" => "No Such Pokemon Found"], 404);
        }
        else
        {
            $this->response(["status" => TRUE, "result" => $pokemon, "error" => ""], 200);
        }
    }

    public function ability_all_get()
    {
        $pokemon = $this->AbilityModel->get_all();

        if (empty($pokemon))
        {
            $this->response(["status" => FALSE, "result" => null, "error" => "No Such Ability Found"], 404);
        }
        else
        {
            $this->response(["status" => TRUE, "result" => $pokemon, "error" => ""], 200);
        }
    }

    public function ability_get_by_id_get()
    {
        if (!empty($this->input->get("id")))
        {
            $id = $this->input->get("id");
        }
        else
        {
            $this->response(["status" => FALSE, "result" => null, "error" => "No Such Argument Id Passed"], 404);
        }

        $pokemon = $this->AbilityModel->get_by_id($id);

        if (empty($pokemon))
        {
            $this->response(["status" => FALSE, "result" => null, "error" => "No Such Ability Found"], 404);
        }
        else
        {
            $this->response(["status" => TRUE, "result" => $pokemon, "error" => ""], 200);
        }
    }

    public function ability_get_by_search_get($search = null)
    {
        if (!empty($this->input->get("query")))
        {
            $search = $this->input->get("query");
        }
        else
        {
            $this->response(["status" => FALSE, "result" => null, "error" => "No Such Argument Query Passed"], 404);
        }

        $pokemon = $this->AbilityModel->get_by_search($search);

        if (empty($pokemon))
        {
            $this->response(["status" => FALSE, "result" => null, "error" => "No Such Ability Found"], 404);
        }
        else
        {
            $this->response(["status" => TRUE, "result" => $pokemon, "error" => ""], 200);
        }
    }

    public function create_pokemon_post()
    {
        if (!empty($this->post("id")))
        {
            $id = $this->post("id");
        }
        else
        {
            $this->response(["status" => FALSE, "result" => null, "error" => "No Such Argument Id Passed"], 404);
        }

        if (!empty($this->post("name")))
        {
            $name = $this->post("name");
        }
        else
        {
            $this->response(["status" => FALSE, "result" => null, "error" => "No Such Argument Name Passed"], 404);
        }

        if (!empty($this->post("base_experience")))
        {
            $base_experience = $this->post("base_experience");
        }
        else
        {
            $this->response(["status" => FALSE, "result" => null, "error" => "No Such Argument Base Experience Passed"], 404);
        }
        
        if (!empty($this->post("height")))
        {
            $height = $this->post("height");
        }
        else
        {
            $this->response(["status" => FALSE, "result" => null, "error" => "No Such Argument Height Passed"], 404);
        }

        if (!empty($this->post("weight")))
        {
            $weight = $this->post("weight");
        }
        else
        {
            $this->response(["status" => FALSE, "result" => null, "error" => "No Such Argument Weight Passed"], 404);
        }

        $query = $this->BaseModel->get_by_id($id);

        if (empty($query))
        {
            $data = [
                "id" => $id,
                "name" => $name,
                "base_experience" => $base_experience,
                "height" => $height,
                "weight" => $weight
            ];

            $query = $this->BaseModel->create($data);

            if ($query)
            {
                $this->response(["status" => TRUE, "result" => $data, "error" => ""], 200);
            }
            else
            {
                $this->response(["status" => FALSE, "result" => null, "error" => "Can't Store Data"], 404);
            }        
        }
        else
        {
            $this->response(["status" => FALSE, "result" => null, "error" => "Id $id Exist"], 404);
        }
    }

    public function battle_history_create_post() {
        $win_pokemon_id = $this->post("win_pokemon_id");
        $lose_pokemon_id = $this->post("lose_pokemon_id");
        $winner_health_left = $this->post("winner_health_left");

        $data = [
            "win_pokemon_id" => $win_pokemon_id,
            "lose_pokemon_id" => $lose_pokemon_id,
            "winner_health_left" => $winner_health_left
        ];

        $query = $this->BattleHistoryModel->create($data);

        if ($query) {
            $this->response(["status" => TRUE, "result" => $data, "error" => ""], 200);
        } else {
            $this->response(["status" => FALSE, "result" => null, "error" => "Create Battle History Failed"], 404);
        }
    }

}