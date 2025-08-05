const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

const { onSchedule } = require("firebase-functions/v2/scheduler");

exports.createFromRecurring = onSchedule(
  {
    // schedule: "*/5 * * * *",
    schedule: "0 0 * * *",
    timeZone: "Asia/Bangkok",
  },
  async (event) => {
    try {
      console.log("⏰ กำลังรันฟังก์ชันสร้างรายการจาก recurring");

      const todayStr = new Date().toISOString().split("T")[0];
      const snapshot = await db.collection("recurring")
          .where("nextDate", "==", todayStr)
          .get();

      if (snapshot.empty) {
        console.log("📭 ไม่พบ recurring ใดๆ ที่ตรงกับวันนี้");
        return;
      }

      const batch = db.batch();

      snapshot.forEach((doc) => {
        const data = doc.data();
        const freq = parseInt(data.frequency);
        if (isNaN(freq) || freq <= 0) {
          console.warn(`⚠️ ค่า frequency ไม่ถูกต้อง: ${data.frequency} ใน recurring id: ${doc.id}`);
          return;
        }
        const unit = data.frequencyUnit;
        const nextDate = new Date(todayStr);

        switch(unit) {
          case "days":
            nextDate.setDate(nextDate.getDate() + freq);
            break;
          case "weeks":
            nextDate.setDate(nextDate.getDate() + freq * 7);
            break;
          case "months":
            nextDate.setMonth(nextDate.getMonth() + freq);
            break;
          case "years":
            nextDate.setFullYear(nextDate.getFullYear() + freq);
            break;
          default:
            console.warn(`⚠️ frequencyUnit ไม่ถูกต้อง: ${unit} ใน recurring id: ${doc.id}`);
            return;
        }

        const newExpenseRef = db.collection("expenses").doc();

        batch.set(newExpenseRef, {
          ...data,
          entrytype: "expense",
          status: "รอทำเบิก",
          fromRecurringId: doc.id,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        batch.update(doc.ref, {
          nextDate: nextDate.toISOString().split("T")[0],
        });
      });

      await batch.commit();
      console.log("✅ ดึง recurring แล้วบันทึก expenses สำเร็จ");
    } catch (error) {
      console.error("❌ เกิดข้อผิดพลาดใน createFromRecurring:", error);
    }
  }
);
