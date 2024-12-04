const express = require('express')
const router = express.Router();
const { body, validationResult } = require("express-validator");

const fetchuser = require("../middleware/fetchuser")
const Note=require("../models/Notes")
// ROUTE 1: Get All the notes using Get notes GET:"api/auth/getuser"

router.get("/fetchallnotes", fetchuser, async (req, res) => {
  const notes = await Note.find({ user: req.user.id });
  res.json(notes);
 
});


// ROUTE add new Note using POST "api/note/addnote"- login required
router.post(
  "/addnote",
  fetchuser,
  [
    body("title")
      .notEmpty()
      .withMessage("Title is required")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters long"),
    body("description")
      .notEmpty()
      .withMessage(" description is required")
      .isLength({ min: 5 })
      .withMessage("description must be at least 5 characters long"),
  ],
  async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const note = new Note({
          title,
          description,
          tag,
          user: req.user.id,
        });
        const savenote = await note.save();
        res.json(savenote);
    } catch (error) {
         console.error(error);
         res.status(500).json({ error: "An unexpected error occurred." });
    }
    
  }
);

// Route 3 Update existing node  the note POST:
router.put("/updatenote/:id", fetchuser, async (req, res) => {
//   const notes = await Note.find({ user: req.user.id });
  const {title,description,tag,}=req.body;
  // create a newNote object 
  const newNote = {};
  if(title) {
      newNote.title = title;
    };
    if(description) {
      newNote.description = description;
    };
    if(tag){
        newNote.tag=tag;
    };

    //find the note to be updated  and updted

    const note= await Note.findById(req.params.id);
    if(!note){
       return  res.status(404).send("Not Found")
    }
    if(note.user.toString()!==req.user.id){
        return res.status(401).send("Not Allowed");
    }
    const newNoteUp=await Note.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
    res.json({ newNoteUp });
 
});


// ROUT 4 :Delete the Note and login required  using delete :api/notes/deletenote
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  //   const notes = await Note.find({ user: req.user.id });
  
  // create a newNote object


  //find the note to be deleted   and delted

  const note = await Note.findById(req.params.id);
  if (!note) {
    return res.status(404).send("Not Found");
  }
  // allow deletion only user owns this if user owns this
  if (note.user.toString() !== req.user.id) {
    return res.status(401).send("Not Allowed");
  }
  const newNoteUp = await Note.findByIdAndDelete(
    req.params.id
  );
  res.json({ Success: "Note has been deleted ", note: note });
});


module.exports=router
