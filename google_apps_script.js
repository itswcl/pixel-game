/* eslint-disable */
function doGet(e) {
  const action = e.parameter.action;
  
  if (action === 'getQuestions') {
    return getQuestions(e);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'submitResult') {
      return submitResult(data);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Invalid action' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getQuestions(e) {
  // Access the "Questions" sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Questions') || SpreadsheetApp.getActiveSpreadsheet().getSheetByName('題目'); 
  // Fallback to chinese name just in case, but prefer English
  
  const data = sheet.getDataRange().getValues();
  // Remove header
  const headers = data.shift();
  
  // Format: [ID, Question, A, B, C, D, Answer]
  // Assuming columns: A=ID, B=Question, C=OptionA, D=OptionB, E=OptionC, F=OptionD, G=Answer
  // Indices: 0, 1, 2, 3, 4, 5, 6
  
  const questions = data.map(row => ({
    id: row[0],
    text: row[1],
    options: {
      A: row[2],
      B: row[3],
      C: row[4],
      D: row[5]
    },
    answer: row[6]
  }));
  
  // Shuffle and pick N
  const count = parseInt(e.parameter.count || 10);
  const shuffled = questions.sort(() => 0.5 - Math.random()).slice(0, count);
  
  return ContentService.createTextOutput(JSON.stringify({ status: 'success', questions: shuffled }))
    .setMimeType(ContentService.MimeType.JSON);
}

function submitResult(data) {
  // data: { id: 'userId', answers: { qId1: 'A', qId2: 'B' } }
  const userId = data.userId;
  const userAnswers = data.answers;
  
  // Get Questions to key answers
  const questionSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Questions') || SpreadsheetApp.getActiveSpreadsheet().getSheetByName('題目');
  const qData = questionSheet.getDataRange().getValues();
  qData.shift(); // remove header
  
  // Create map of ID -> Answer
  const answerKey = {};
  qData.forEach(row => {
    answerKey[row[0]] = row[6]; // ID is col 0, Answer is col 6
  });
  
  let score = 0;
  let correctCount = 0;
  const totalQuestions = Object.keys(userAnswers).length;
  
  for (const [qId, ans] of Object.entries(userAnswers)) {
    if (String(answerKey[qId]).trim().toUpperCase() === String(ans).trim().toUpperCase()) {
      score += 10; // 10 points per question
      correctCount++;
    }
  }
  
  // Update Result Sheet
  // Columns: ID, PlayCount, TotalScore, MaxScore, FirstPassScore, AttemptsToPass, LastPlayed
  const resultSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Responses') || SpreadsheetApp.getActiveSpreadsheet().getSheetByName('回答');
  const rData = resultSheet.getDataRange().getValues();
  
  let rowIndex = -1;
  // Find user row (skip header)
  for (let i = 1; i < rData.length; i++) {
    if (String(rData[i][0]) === String(userId)) {
      rowIndex = i;
      break;
    }
  }
  
  const now = new Date();
  
  if (rowIndex > -1) {
    // Update existing user
    // Row mapping: 0:ID, 1:Count, 2:TotalScore, 3:MaxScore, 4:FirstPassScore, 5:AttemptsToPass, 6:LastTime
    const row = rData[rowIndex];
    const currentCount = row[1] + 1;
    // const currentTotalResponse = (row[2] || 0) + score; 
    const newMax = Math.max(row[3] || 0, score);
    
    // Logic for FirstPass & Attempts logic
    const passThreshold = data.passThreshold || 3;
    const isPassed = correctCount >= passThreshold;
    const existingFirstPass = row[4]; // Column E
    
    // UPDATING ROW
    // 1: Count
    resultSheet.getRange(rowIndex + 1, 2).setValue(currentCount);
    // 3: Max
    resultSheet.getRange(rowIndex + 1, 4).setValue(newMax);
    // 7: Timestamp (Col 7)
    resultSheet.getRange(rowIndex + 1, 7).setValue(now);
    
    // 4 & 5: First Pass Info (Only if never passed before)
    if (existingFirstPass === "" && isPassed) {
       resultSheet.getRange(rowIndex + 1, 5).setValue(score); // FirstPassScore
       resultSheet.getRange(rowIndex + 1, 6).setValue(currentCount); // AttemptsToPass
    }
    
  } else {
    // Create new record
    // ID, 1, Score, Score, FirstPass?, Attempts?, Now
    const passThreshold = data.passThreshold || 3;
    const isPassed = correctCount >= passThreshold;
    
    const firstPassScore = isPassed ? score : "";
    const attemptsToPass = isPassed ? 1 : "";
    
    resultSheet.appendRow([userId, 1, score, score, firstPassScore, attemptsToPass, now]);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ 
    status: 'success', 
    score: score, 
    correctCount: correctCount,
    totalQuestions: totalQuestions
  })).setMimeType(ContentService.MimeType.JSON);
}
