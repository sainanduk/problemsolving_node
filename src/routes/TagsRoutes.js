const express = require("express");
const router = express.Router();
const { Tag, Question, QuestionTags } = require("../models");
const TagsController = require("../controllers/TagsController");

const tagsController = new TagsController({ Tag, Question, QuestionTags });

// All routes have `/tags/...` prefix directly
router.get("/tags", (req, res) => tagsController.getAllTags(req, res));
router.get("/tags/:id", (req, res) => tagsController.getTagById(req, res));
router.post("/tags", (req, res) => tagsController.createTag(req, res));
router.put("/tags/:id", (req, res) => tagsController.updateTag(req, res));
router.delete("/tags/:id", (req, res) => tagsController.deleteTag(req, res));

router.post("/tags/assign", (req, res) => tagsController.addTagToQuestion(req, res));

module.exports = router;
