// NOTIFICATION INBOX
const exampleDataFromDB = [
    {
        title: "Queue Update",
        message: "You are now #3 in line for Business #1.",
        time: "5 minutes ago",
        unread: true
    }
];

const list = document.getElementById("notificationList");
const template = document.getElementById("notificationTemplate");

exampleDataFromDB.forEach(n => {
    const clone = template.content.cloneNode(true);

    clone.querySelector(".notif-title").textContent = n.title;
    clone.querySelector(".notif-message").textContent = n.message;
    clone.querySelector(".notif-time").textContent = n.time;

    if (n.unread) {
        clone.querySelector(".notification-card").classList.add("unread");
    }

    list.appendChild(clone);
});
