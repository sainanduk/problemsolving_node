const axios = require("axios");
const redis = require("../config/redis");

class SubmissionsController {
  constructor(Submission, Testcase, UserQuestion, Question) {
    this.Submission = Submission;
    this.Testcase = Testcase;
    this.UserQuestion = UserQuestion;
    this.Question = Question;

    this.JUDGE0_URL = "https://ce.judge0.com/submissions";
    this.JUDGE0_HEADERS = {
      "Content-Type": "application/json",
      "X-RapidAPI-Key": process.env.JUDGE0_API_KEY,
      "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    };
  }

  // Create submission
  async createSubmission(req, res) {
    try {
      const {  language_id, code } = req.body;
      const user_id = req.user.userId; // Fixed: should be userId not id
      console.log(user_id);
      const question_id = req.params.questionIdid;
      // Save as pending
      const submission = await this.Submission.create({
        user_id,
        question_id,
        language: language_id, // Fixed: model expects 'language' not 'language_id'
        code,
        status: "pending",
      });

      // Load testcases (cache first)
      const cacheKey = `question:${question_id}:testcases`;
      let testcases = await redis.get(cacheKey);

      if (testcases) {
        testcases = JSON.parse(testcases);
      } else {
        testcases = await this.Testcase.findAll({
          where: { question_id },
          attributes: ["input", "output"],
        });
        if (!testcases || testcases.length === 0) {
          return res.status(400).json({ error: "No testcases found" });
        }
        await redis.set(cacheKey, JSON.stringify(testcases), "EX", 3600);
      }

      // Run against all testcases
      let allPassed = true;
      let execution_time = 0;
      let memory_used = 0;
      let user_question = await this.UserQuestion.findOne({
        where: {
          user_id: user_id, 
          question_id: question_id
        }
      });
      if (!user_question) {
        await this.UserQuestion.create({user_id: user_id, question_id: question_id, status: "attempted", last_solved_at: new Date()});
      }

      for (const tc of testcases) {
        const judgeResponse = await axios.post(
          this.JUDGE0_URL + "?base64_encoded=false&wait=true",
          {
            source_code: code,
            language_id: language_id,
            stdin: tc.input,
            expected_output: tc.output,
          }
        );

        const result = judgeResponse.data;
        
        execution_time = Math.max(execution_time, result.time || 0);
        memory_used = Math.max(memory_used, result.memory || 0);
        

        if (result.status?.description !== "Accepted") {
          allPassed = false;
          let status = "wrong_answer";
          if (result.status?.description === "Compilation Error") status = "compilation_error";
          else if (result.status?.description === "Time Limit Exceeded") status = "time_limit_exceeded";
          else if (result.status?.description === "Runtime Error") status = "runtime_error";

          await submission.update({ status, execution_time, memory_used });
          if (user_question.status !== "solved") {
            await this.UserQuestion.update({status: "attempted", last_solved_at: new Date()}, {where: {user_id: user_id, question_id: question_id}});
          }
          
          return res.json({submission, input: tc.input, output: tc.output, stdout: result.stdout}); // stop early on fail
        }
      }

      // All passed
      if (allPassed) {
        await submission.update({
          status: "accepted",
          execution_time,
          memory_used,
        });
        await this.UserQuestion.update({status: "solved", last_solved_at: new Date()}, {where: {user_id: user_id, question_id: question_id}});
      }

      res.status(201).json({ submission });
    } catch (error) {
      console.error(error.response?.data || error.message);
      res.status(500).json({ error: "Failed to create submission" });
    }
  }

  // Get submissions by logged-in user grouped by date
  async getUserSubmissions(req, res) {
    try {
      console.log("Getting submissions for user:", req.user.userId);
      
      const submissions = await this.Submission.findAll({
        include: [
          {
            model: this.Question,
            attributes: ['title', 'difficulty'],
          }
        ],
        where: { user_id: req.user.userId },
        order: [["createdAt", "DESC"]],
      });

      console.log("Found submissions:", submissions.length);

      // Group submissions by date
      const groupedSubmissions = {};
      
      submissions.forEach(submission => {
        // Extract date in YYYY-MM-DD format
        const submissionDate = submission.createdAt.toISOString().split('T')[0];
        
        if (!groupedSubmissions[submissionDate]) {
          groupedSubmissions[submissionDate] = [];
        }

        // Format each submission
        const formattedSubmission = {
          id: submission.id,
          title: submission.Question?.title || "Unknown Question",
          language: this.mapLanguageIdToName(submission.language),
          difficulty: submission.Question?.difficulty?.toLowerCase() || "unknown",
          submittedAt: submission.createdAt.toISOString(),
          code: submission.code,
          status: submission.status
        };

        groupedSubmissions[submissionDate].push(formattedSubmission);
      });

      // Convert to array format and sort by date (most recent first)
      const result = Object.keys(groupedSubmissions)
        .sort((a, b) => new Date(b) - new Date(a))
        .map(date => ({
          date: date,
          submissions: groupedSubmissions[date].sort((a, b) => 
            new Date(b.submittedAt) - new Date(a.submittedAt)
          )
        }));

      console.log("Grouped submissions by", Object.keys(groupedSubmissions).length, "dates");

      res.json(result);
    } catch (error) {
      console.error("Error in getUserSubmissions:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // Helper method to map language IDs to readable names
  mapLanguageIdToName(languageId) {
    const languageMap = {
      '50': 'C',
      '54': 'C++',
      '62': 'Java',
      '71': 'Python',
      '63': 'JavaScript',
      '68': 'PHP',
      '51': 'C#',
      '60': 'Go',
      '72': 'Ruby',
      '73': 'Rust',
      '74': 'TypeScript',
      '75': 'C',
      '76': 'C++',
      '77': 'COBOL',
      '78': 'Kotlin',
      '79': 'Objective-C',
      '80': 'R',
      '81': 'Scala',
      '82': 'SQL',
      '83': 'Swift',
      '84': 'Visual Basic'
    };

    // If it's already a string name, return it
    if (typeof languageId === 'string' && isNaN(languageId)) {
      return languageId;
    }

    // If it's a number or string number, map it
    return languageMap[languageId.toString()] || languageId.toString();
  }

  // // Get submission by ID
  // async getSubmissionById(req, res) {
  //   try {
  //     const { id } = req.params;
  //     const submission = await this.Submission.findByPk(id);
  //     if (!submission) return res.status(404).json({ error: "Submission not found" });
  //     res.json(submission);
  //   } catch (error) {
  //     res.status(500).json({ error: error.message });
  //   }
  // }

  // Get submissions by question
  async getSubmissionsByQuestion(req, res) {
    
    try {
      const { questionId } = req.params;
      const userId = req.user.userId;
      
      const submissions = await this.Submission.findAll({
        where: { question_id: questionId, user_id: userId },
        order: [["createdAt", "DESC"]],
      });
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  async runCode(req, res) {
    try {
      const { code, language_id, input } = req.body;
      console.log(req.body);
      
      if (!code || !language_id ) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const result = await axios.post(
        this.JUDGE0_URL + "?base64_encoded=false&wait=true",
        {
          source_code: code,
          language_id: language_id,
          stdin: input,
        }
      );
      console.log(result.data);
      res.json(result.data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = SubmissionsController;
