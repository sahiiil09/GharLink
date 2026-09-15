/* =========================================================
   GharLink — Complete App JavaScript
   No alert / confirm / prompt
========================================================= */

const $ = (id) => document.getElementById(id);


/* =========================================================
   STORAGE
========================================================= */

function loadData(key, fallback = []) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch {
        return fallback;
    }
}

let tasks = loadData("gharLinkTasks");
let bills = loadData("gharLinkBills");
let family = loadData("gharLinkFamily");
let notes = loadData("gharLinkNotes");
let links = loadData("gharLinkLinks");

let theme =
    localStorage.getItem("gharLinkTheme") || "light";

let currentProducts = [];
let editingBillId = null;


function save(key, value) {
    localStorage.setItem(
        key,
        JSON.stringify(value)
    );
}


/* =========================================================
   SMALL APP MESSAGE
========================================================= */

function showMessage(message, type = "success") {

    let toast =
        document.getElementById("gharLinkToast");

    if (!toast) {

        toast =
            document.createElement("div");

        toast.id =
            "gharLinkToast";

        toast.style.cssText = `
            position:fixed;
            left:50%;
            bottom:82px;
            transform:translateX(-50%) translateY(20px);
            width:calc(100% - 32px);
            max-width:420px;
            padding:14px 16px;
            border-radius:16px;
            background:var(--card);
            color:var(--text);
            border:1px solid var(--border);
            box-shadow:0 12px 35px rgba(0,0,0,.18);
            display:flex;
            align-items:center;
            gap:10px;
            z-index:9999;
            opacity:0;
            transition:.25s ease;
            font-size:14px;
            font-weight:600;
        `;

        document.body.appendChild(toast);
    }

    toast.innerHTML = `
        <span style="
            width:9px;
            height:9px;
            border-radius:50%;
            background:${type === "error"
                ? "#EF4444"
                : "#10B981"};
            flex:none;
        "></span>

        <span>
            ${escapeHTML(message)}
        </span>
    `;

    requestAnimationFrame(() => {

        toast.style.opacity = "1";

        toast.style.transform =
            "translateX(-50%) translateY(0)";
    });

    clearTimeout(toast.timer);

    toast.timer =
        setTimeout(() => {

            toast.style.opacity = "0";

            toast.style.transform =
                "translateX(-50%) translateY(20px)";

        }, 2600);
}


/* =========================================================
   CUSTOM CONFIRM
========================================================= */

function openConfirm(
    title,
    message,
    onConfirm
) {

    const modal =
        $("detailModal");

    $("detailTitle").textContent =
        title;

    $("detailContent").innerHTML = `

        <div class="detail-box">

            <strong>
                ${escapeHTML(message)}
            </strong>

            <span>
                This action cannot be undone.
            </span>

        </div>

        <div style="
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:10px;
            margin-top:16px;
        ">

            <button
                type="button"
                id="cancelConfirm"
                class="secondary-button"
            >
                Cancel
            </button>

            <button
                type="button"
                id="acceptConfirm"
                class="primary-button"
                style="background:#EF4444;"
            >
                Delete
            </button>

        </div>
    `;

    modal.classList.add("show");

    $("cancelConfirm").onclick = () => {
        modal.classList.remove("show");
    };

    $("acceptConfirm").onclick = () => {

        modal.classList.remove("show");

        onConfirm();
    };
}


/* =========================================================
   NAVIGATION
========================================================= */

const screens =
    document.querySelectorAll(".screen");

const navItems =
    document.querySelectorAll(".nav-item");

const quickCards =
    document.querySelectorAll(".quick-card");


function showScreen(screenId) {

    screens.forEach(screen => {
        screen.classList.remove("active");
    });

    const screen =
        $(screenId);

    if (screen) {
        screen.classList.add("active");
    }

    navItems.forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.screen === screenId
        );

    });

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    updateHome();
}


navItems.forEach(item => {

    item.addEventListener(
        "click",
        () => showScreen(item.dataset.screen)
    );

});


quickCards.forEach(card => {

    card.addEventListener(
        "click",
        () => showScreen(card.dataset.screen)
    );

});


/* =========================================================
   DATE
========================================================= */

function updateDate() {

    const date =
        new Date();

    $("currentDate").textContent =
        date.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
}

updateDate();


/* =========================================================
   TASKS
========================================================= */

function openTaskModal(task = null) {

    $("taskModal").classList.add("show");

    if (task) {

        $("taskModalTitle").textContent =
            "Edit Task";

        $("taskSubmitText").textContent =
            "Save Changes";

        $("editingTaskId").value =
            task.id;

        $("taskName").value =
            task.name;

        $("taskDeadline").value =
            task.deadline;

    } else {

        $("taskModalTitle").textContent =
            "Add Task";

        $("taskSubmitText").textContent =
            "Add Task";

        $("editingTaskId").value =
            "";

        $("taskName").value =
            "";

        const today =
            new Date();

        today.setMinutes(
            today.getMinutes() -
            today.getTimezoneOffset()
        );

        $("taskDeadline").value =
            today.toISOString().split("T")[0];
    }

    setTimeout(
        () => $("taskName").focus(),
        100
    );
}


function closeTaskModal() {

    $("taskModal").classList.remove("show");

    $("taskForm").reset();

    $("editingTaskId").value =
        "";
}


$("addTaskButton").addEventListener(
    "click",
    () => openTaskModal()
);


$("closeTaskModal").addEventListener(
    "click",
    closeTaskModal
);


$("taskModal").addEventListener(
    "click",
    event => {

        if (
            event.target ===
            $("taskModal")
        ) {
            closeTaskModal();
        }

    }
);


$("taskForm").addEventListener(
    "submit",
    event => {

        event.preventDefault();

        const name =
            $("taskName").value.trim();

        const deadline =
            $("taskDeadline").value;

        const editingId =
            $("editingTaskId").value;

        if (!name) {

            showMessage(
                "Please enter a task name.",
                "error"
            );

            $("taskName").focus();

            return;
        }

        if (!deadline) {

            showMessage(
                "Please select a deadline.",
                "error"
            );

            return;
        }

        if (editingId) {

            const task =
                tasks.find(
                    t =>
                        t.id ===
                        Number(editingId)
                );

            if (!task) return;

            task.name =
                name;

            task.deadline =
                deadline;

            save(
                "gharLinkTasks",
                tasks
            );

            closeTaskModal();

            renderTasks();

            updateHome();

            showMessage(
                "Task updated successfully."
            );

        } else {

            tasks.unshift({

                id:
                    Date.now(),

                name,

                deadline,

                completed:
                    false,

                createdAt:
                    new Date().toISOString(),

                completedAt:
                    null
            });

            save(
                "gharLinkTasks",
                tasks
            );

            closeTaskModal();

            renderTasks();

            updateHome();

            showMessage(
                "Task added successfully."
            );
        }
    }
);


function toggleTask(id) {

    const task =
        tasks.find(
            t => t.id === id
        );

    if (!task) return;

    task.completed =
        !task.completed;

    task.completedAt =
        task.completed
            ? new Date().toISOString()
            : null;

    save(
        "gharLinkTasks",
        tasks
    );

    renderTasks();

    updateHome();

    showMessage(
        task.completed
            ? "Task marked as completed."
            : "Task moved back to pending."
    );
}


function editTask(id) {

    const task =
        tasks.find(
            t => t.id === id
        );

    if (task) {
        openTaskModal(task);
    }
}


function deleteTask(id) {

    const task =
        tasks.find(
            t => t.id === id
        );

    if (!task) return;

    openConfirm(
        "Delete Task?",
        `Delete "${task.name}"?`,
        () => {

            tasks =
                tasks.filter(
                    t => t.id !== id
                );

            save(
                "gharLinkTasks",
                tasks
            );

            renderTasks();

            updateHome();

            showMessage(
                "Task deleted."
            );
        }
    );
}


function formatDate(value) {

    if (!value) {
        return "No deadline";
    }

    return new Date(
        value + "T00:00:00"
    ).toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}


function isOverdue(task) {

    if (task.completed) {
        return false;
    }

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    const deadline =
        new Date(
            task.deadline +
            "T00:00:00"
        );

    return deadline < today;
}


function getDeadlineText(task) {

    if (task.completed) {

        if (task.completedAt) {

            const date =
                new Date(
                    task.completedAt
                );

            return `Completed • ${date.toLocaleDateString(
                "en-IN",
                {
                    day: "numeric",
                    month: "short"
                }
            )}`;
        }

        return "Completed";
    }

    if (isOverdue(task)) {

        return `Overdue • ${formatDate(
            task.deadline
        )}`;
    }

    return `Pending • Due ${formatDate(
        task.deadline
    )}`;
}


function renderTasks() {

    const list =
        $("taskList");

    if (!tasks.length) {

        list.innerHTML = `

            <div class="empty-card">

                <div class="empty-icon">
                    <svg>
                        <use href="#icon-check"></use>
                    </svg>
                </div>

                <div>
                    <strong>No tasks added</strong>

                    <p>
                        Add your first household task.
                    </p>
                </div>

            </div>
        `;

        updateTaskCounts();

        return;
    }

    list.innerHTML = "";

    tasks.forEach(task => {

        const item =
            document.createElement("div");

        item.className =
            `task-item ${
                task.completed
                    ? "completed"
                    : ""
            } ${
                isOverdue(task)
                    ? "overdue"
                    : ""
            }`;

        item.innerHTML = `

            <button
                type="button"
                class="task-check"
                aria-label="Toggle task"
            >
                ${
                    task.completed
                        ? "✓"
                        : ""
                }
            </button>

            <div class="task-content">

                <strong>
                    ${escapeHTML(task.name)}
                </strong>

                <span>
                    ${getDeadlineText(task)}
                </span>

            </div>

            <div class="task-actions">

                <button
                    type="button"
                    class="edit-task"
                    aria-label="Edit task"
                >
                    <svg>
                        <use href="#icon-edit"></use>
                    </svg>
                </button>

                <button
                    type="button"
                    class="delete-task"
                    aria-label="Delete task"
                >
                    <svg>
                        <use href="#icon-trash"></use>
                    </svg>
                </button>

            </div>
        `;

        item.querySelector(
            ".task-check"
        ).onclick =
            () => toggleTask(task.id);

        item.querySelector(
            ".edit-task"
        ).onclick =
            () => editTask(task.id);

        item.querySelector(
            ".delete-task"
        ).onclick =
            () => deleteTask(task.id);

        list.appendChild(item);
    });

    updateTaskCounts();
}


function updateTaskCounts() {

    const completed =
        tasks.filter(
            task => task.completed
        ).length;

    $("taskCount").textContent =
        tasks.length;

    $("completedCount").textContent =
        completed;
}


/* =========================================================
   BILLS
========================================================= */

function openBillModal(bill = null) {

    $("billModal").classList.add("show");

    if (bill) {

        editingBillId =
            bill.id;

        $("billModalTitle").textContent =
            "Edit Bill";

        $("saveBillText").textContent =
            "Save Changes";

        currentProducts =
            bill.products.map(
                product => ({
                    ...product
                })
            );

    } else {

        editingBillId =
            null;

        $("billModalTitle").textContent =
            "Create Bill";

        $("saveBillText").textContent =
            "Save Bill";

        currentProducts = [];
    }

    $("productName").value =
        "";

    $("productQty").value =
        1;

    $("productPrice").value =
        "";

    renderBillProducts();

    setTimeout(
        () => $("productName").focus(),
        100
    );
}


function closeBillModal() {

    $("billModal").classList.remove(
        "show"
    );

    currentProducts = [];

    editingBillId = null;

    $("billForm").reset();

    $("productQty").value =
        1;

    $("billModalTitle").textContent =
        "Create Bill";

    $("saveBillText").textContent =
        "Save Bill";

    renderBillProducts();
}


$("createBillButton").addEventListener(
    "click",
    () => openBillModal()
);


$("closeBillModal").addEventListener(
    "click",
    closeBillModal
);


$("billModal").addEventListener(
    "click",
    event => {

        if (
            event.target ===
            $("billModal")
        ) {
            closeBillModal();
        }

    }
);


/* ADD PRODUCT */

$("addProductButton").addEventListener(
    "click",
    addProduct
);


function addProduct() {

    const name =
        $("productName").value.trim();

    const quantity =
        Number(
            $("productQty").value
        );

    const price =
        Number(
            $("productPrice").value
        );

    if (!name) {

        showMessage(
            "Please enter a product name.",
            "error"
        );

        $("productName").focus();

        return;
    }

    if (
        !quantity ||
        quantity < 1
    ) {

        showMessage(
            "Please enter a valid quantity.",
            "error"
        );

        $("productQty").focus();

        return;
    }

    if (
        Number.isNaN(price) ||
        price < 0
    ) {

        showMessage(
            "Please enter a valid price.",
            "error"
        );

        $("productPrice").focus();

        return;
    }

    currentProducts.push({

        id:
            Date.now() +
            Math.floor(
                Math.random() * 1000
            ),

        name,

        quantity,

        price,

        total:
            quantity * price
    });

    $("productName").value =
        "";

    $("productQty").value =
        1;

    $("productPrice").value =
        "";

    renderBillProducts();

    $("productName").focus();
}


function removeProduct(id) {

    currentProducts =
        currentProducts.filter(
            product =>
                product.id !== id
        );

    renderBillProducts();

    showMessage(
        "Product removed."
    );
}


function getBillTotal() {

    return currentProducts.reduce(
        (sum, product) =>
            sum +
            Number(product.total),
        0
    );
}


function renderBillProducts() {

    const container =
        $("billProducts");

    if (!currentProducts.length) {

        container.innerHTML = `

            <div class="bill-empty">
                No products added yet.
            </div>
        `;

    } else {

        container.innerHTML =
            "";

        currentProducts.forEach(
            product => {

                const row =
                    document.createElement(
                        "div"
                    );

                row.className =
                    "product-row";

                row.innerHTML = `

                    <div class="product-info">

                        <strong>
                            ${escapeHTML(
                                product.name
                            )}
                        </strong>

                        <span>
                            ${product.quantity}
                            ×
                            ₹${formatMoney(
                                product.price
                            )}
                        </span>

                    </div>

                    <div class="product-price">
                        ₹${formatMoney(
                            product.total
                        )}
                    </div>

                    <button
                        type="button"
                        class="remove-product"
                        aria-label="Remove product"
                    >
                        <svg>
                            <use href="#icon-trash"></use>
                        </svg>
                    </button>
                `;

                row.querySelector(
                    ".remove-product"
                ).onclick =
                    () =>
                        removeProduct(
                            product.id
                        );

                container.appendChild(
                    row
                );
            }
        );
    }

    $("currentBillTotal").textContent =
        `₹${formatMoney(
            getBillTotal()
        )}`;
}


/* SAVE / UPDATE BILL */

$("billForm").addEventListener(
    "submit",
    event => {

        event.preventDefault();

        if (!currentProducts.length) {

            showMessage(
                "Add at least one product first.",
                "error"
            );

            return;
        }

        const total =
            getBillTotal();

        if (editingBillId !== null) {

            const bill =
                bills.find(
                    item =>
                        item.id ===
                        editingBillId
                );

            if (!bill) {

                showMessage(
                    "Bill could not be found.",
                    "error"
                );

                closeBillModal();

                return;
            }

            bill.products =
                currentProducts.map(
                    product => ({
                        ...product
                    })
                );

            bill.total =
                total;

            save(
                "gharLinkBills",
                bills
            );

            closeBillModal();

            renderBills();

            updateHome();

            showScreen(
                "billsScreen"
            );

            showMessage(
                "Bill updated successfully."
            );

            return;
        }


        const bill = {

            id:
                Date.now(),

            billNumber:
                "GL-" +
                String(
                    Date.now()
                ).slice(-6),

            products:
                currentProducts.map(
                    product => ({
                        ...product
                    })
                ),

            total,

            createdAt:
                new Date().toISOString()
        };

        bills.unshift(
            bill
        );

        save(
            "gharLinkBills",
            bills
        );

        closeBillModal();

        renderBills();

        updateHome();

        showScreen(
            "billsScreen"
        );

        showMessage(
            "Bill saved successfully."
        );
    }
);


/* =========================================================
   BILL RENDER
========================================================= */

function renderBills() {

    const container =
        $("recentBills");

    if (!bills.length) {

        container.innerHTML = `

            <div class="empty-card">

                <div class="empty-icon">
                    <svg>
                        <use href="#icon-receipt"></use>
                    </svg>
                </div>

                <div>
                    <strong>No bills yet</strong>

                    <p>
                        Your created bills
                        will appear here.
                    </p>
                </div>

            </div>
        `;

        updateBillStats();

        return;
    }

    container.innerHTML =
        `<div class="bill-list"></div>`;

    const list =
        container.querySelector(
            ".bill-list"
        );

    bills.forEach(bill => {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "bill-card";

        const date =
            new Date(
                bill.createdAt
            );

        card.innerHTML = `

            <div class="bill-card-icon">
                <svg>
                    <use href="#icon-receipt"></use>
                </svg>
            </div>

            <div class="bill-card-info">

                <strong>
                    ${escapeHTML(
                        bill.billNumber
                    )}
                </strong>

                <span>
                    ${bill.products.length}
                    product${
                        bill.products.length !== 1
                            ? "s"
                            : ""
                    }
                    •
                    ${date.toLocaleDateString(
                        "en-IN",
                        {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                        }
                    )}
                </span>

            </div>

            <div class="bill-card-amount">
                ₹${formatMoney(
                    bill.total
                )}
            </div>
        `;

        card.onclick =
            () => openBillDetails(bill);

        list.appendChild(card);
    });

    updateBillStats();
}


function updateBillStats() {

    $("billCount").textContent =
        bills.length;

    const total =
        bills.reduce(
            (sum, bill) =>
                sum +
                Number(bill.total),
            0
        );

    $("billTotalAmount").textContent =
        `₹${formatMoney(total)}`;
}


/* =========================================================
   BILL DETAILS
========================================================= */

function openBillDetails(bill) {

    $("detailTitle").textContent =
        bill.billNumber;

    let productsHTML =
        "";

    bill.products.forEach(
        product => {

            productsHTML += `

                <div class="product-row">

                    <div class="product-info">

                        <strong>
                            ${escapeHTML(
                                product.name
                            )}
                        </strong>

                        <span>
                            ${product.quantity}
                            ×
                            ₹${formatMoney(
                                product.price
                            )}
                        </span>

                    </div>

                    <div class="product-price">
                        ₹${formatMoney(
                            product.total
                        )}
                    </div>

                </div>
            `;
        }
    );


    const date =
        new Date(
            bill.createdAt
        );


    $("detailContent").innerHTML = `

        <div class="detail-box">

            <strong>
                Bill Date
            </strong>

            <span>
                ${date.toLocaleDateString(
                    "en-IN",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                )}
            </span>

        </div>


        <div class="bill-products">
            ${productsHTML}
        </div>


        <div class="bill-total">

            <span>
                Total
            </span>

            <strong>
                ₹${formatMoney(
                    bill.total
                )}
            </strong>

        </div>


        <div class="bill-detail-actions">

            <button
                type="button"
                class="secondary-button edit-button"
                id="editBillButton"
            >
                <svg>
                    <use href="#icon-edit"></use>
                </svg>
                Edit
            </button>


            <button
                type="button"
                class="secondary-button danger"
                id="deleteBillButton"
            >
                <svg>
                    <use href="#icon-trash"></use>
                </svg>
                Delete
            </button>


            <button
                type="button"
                class="primary-button"
                id="printBillButton"
            >
                <svg>
                    <use href="#icon-print"></use>
                </svg>
                Print / PDF
            </button>

        </div>
    `;


    $("detailModal").classList.add(
        "show"
    );


    $("editBillButton").onclick =
        () => {

            $("detailModal").classList.remove(
                "show"
            );

            openBillModal(bill);
        };


    $("deleteBillButton").onclick =
        () => deleteBill(bill.id);


    $("printBillButton").onclick =
        () => printBill(bill.id);
}


/* =========================================================
   DELETE BILL
========================================================= */

function deleteBill(id) {

    const bill =
        bills.find(
            item =>
                item.id === id
        );

    if (!bill) return;

    openConfirm(
        "Delete Bill?",
        `Delete ${bill.billNumber}?`,
        () => {

            bills =
                bills.filter(
                    item =>
                        item.id !== id
                );

            save(
                "gharLinkBills",
                bills
            );

            renderBills();

            updateHome();

            showScreen(
                "billsScreen"
            );

            showMessage(
                "Bill deleted."
            );
        }
    );
}


/* =========================================================
   PRINT / PDF
========================================================= */

function printBill(id) {

    const bill =
        bills.find(
            item =>
                item.id === id
        );

    if (!bill) return;

    let rows =
        "";

    bill.products.forEach(
        product => {

            rows += `

                <tr>

                    <td>
                        ${escapeHTML(
                            product.name
                        )}
                    </td>

                    <td>
                        ${product.quantity}
                    </td>

                    <td>
                        ₹${formatMoney(
                            product.price
                        )}
                    </td>

                    <td>
                        ₹${formatMoney(
                            product.total
                        )}
                    </td>

                </tr>
            `;
        }
    );


    const printWindow =
        window.open(
            "",
            "_blank"
        );


    if (!printWindow) {

        showMessage(
            "Please allow pop-ups to print the bill.",
            "error"
        );

        return;
    }


    printWindow.document.write(`

        <!DOCTYPE html>

        <html>

        <head>

            <title>
                ${escapeHTML(
                    bill.billNumber
                )}
            </title>

            <style>

                body {
                    font-family:
                        Arial,
                        sans-serif;

                    padding:30px;

                    color:#222;
                }

                h1 {
                    margin-bottom:4px;
                }

                p {
                    color:#666;
                }

                table {
                    width:100%;
                    border-collapse:collapse;
                    margin-top:25px;
                }

                th,
                td {
                    padding:12px;
                    border-bottom:
                        1px solid #ddd;
                    text-align:left;
                }

                .total {
                    text-align:right;
                    font-size:20px;
                    font-weight:bold;
                    margin-top:22px;
                }

            </style>

        </head>

        <body>

            <h1>
                GharLink
            </h1>

            <p>
                ${escapeHTML(
                    bill.billNumber
                )}
            </p>

            <p>
                ${new Date(
                    bill.createdAt
                ).toLocaleDateString(
                    "en-IN",
                    {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                    }
                )}
            </p>

            <table>

                <thead>

                    <tr>
                        <th>Product</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>

                </thead>

                <tbody>
                    ${rows}
                </tbody>

            </table>

            <div class="total">
                Total:
                ₹${formatMoney(
                    bill.total
                )}
            </div>

        </body>

        </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(
        () => printWindow.print(),
        300
    );
}


/* =========================================================
   HOME
========================================================= */

function updateHome() {

    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;

    const pending =
        tasks.length -
        completed;

    $("homeTotalTasks").textContent =
        tasks.length;

    $("homePendingTasks").textContent =
        pending;

    $("homeCompletedTasks").textContent =
        completed;

    $("homeTotalBills").textContent =
        bills.length;

    renderHomeTasks();

    renderHomeBills();
}


function renderHomeTasks() {

    const container =
        $("homeTasks");

    const recent =
        tasks.slice(0, 3);

    if (!recent.length) {

        container.innerHTML = `

            <div class="empty-card">

                <div class="empty-icon">
                    <svg>
                        <use href="#icon-check"></use>
                    </svg>
                </div>

                <div>

                    <strong>
                        No tasks yet
                    </strong>

                    <p>
                        Your tasks will appear here.
                    </p>

                </div>

            </div>
        `;

        return;
    }

    container.innerHTML =
        `<div class="task-list"></div>`;

    const list =
        container.querySelector(
            ".task-list"
        );

    recent.forEach(task => {

        const item =
            document.createElement(
                "div"
            );

        item.className =
            `task-item ${
                task.completed
                    ? "completed"
                    : ""
            }`;

        item.innerHTML = `

            <button
                type="button"
                class="task-check"
            >
                ${
                    task.completed
                        ? "✓"
                        : ""
                }
            </button>

            <div class="task-content">

                <strong>
                    ${escapeHTML(
                        task.name
                    )}
                </strong>

                <span>
                    ${getDeadlineText(
                        task
                    )}
                </span>

            </div>
        `;

        item.querySelector(
            ".task-check"
        ).onclick =
            () => toggleTask(
                task.id
            );

        list.appendChild(item);
    });
}


function renderHomeBills() {

    const container =
        $("homeBills");

    const recent =
        bills.slice(0, 3);

    if (!recent.length) {

        container.innerHTML = `

            <div class="empty-card">

                <div class="empty-icon">
                    <svg>
                        <use href="#icon-receipt"></use>
                    </svg>
                </div>

                <div>

                    <strong>
                        No bills yet
                    </strong>

                    <p>
                        Your bills will appear here.
                    </p>

                </div>

            </div>
        `;

        return;
    }

    container.innerHTML =
        `<div class="bill-list"></div>`;

    const list =
        container.querySelector(
            ".bill-list"
        );

    recent.forEach(bill => {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "bill-card";

        card.innerHTML = `

            <div class="bill-card-icon">

                <svg>
                    <use href="#icon-receipt"></use>
                </svg>

            </div>

            <div class="bill-card-info">

                <strong>
                    ${escapeHTML(
                        bill.billNumber
                    )}
                </strong>

                <span>
                    ${bill.products.length}
                    product${
                        bill.products.length !== 1
                            ? "s"
                            : ""
                    }
                </span>

            </div>

            <div class="bill-card-amount">
                ₹${formatMoney(
                    bill.total
                )}
            </div>
        `;

        card.onclick =
            () => openBillDetails(bill);

        list.appendChild(card);
    });
}


/* =========================================================
   MORE
========================================================= */

document
    .querySelectorAll(".more-item")
    .forEach(item => {

        item.addEventListener(
            "click",
            () =>
                openMoreSection(
                    item.dataset.more
                )
        );

    });


function openMoreSection(type) {

    if (type === "family") {
        openFamily();
        return;
    }

    if (type === "notes") {
        openNotes();
        return;
    }

    if (type === "links") {
        openLinks();
        return;
    }

    if (type === "settings") {
        openSettings();
        return;
    }

    if (type === "about") {
        openAbout();
    }
}


/* =========================================================
   FAMILY
========================================================= */

function openFamily() {

    $("detailTitle").textContent =
        "Family";

    $("detailContent").innerHTML = `

        <form id="familyForm">

            <div class="form-group">

                <label>Name</label>

                <input
                    id="familyName"
                    type="text"
                    placeholder="Family member name"
                    required
                >

            </div>

            <div class="form-group">

                <label>Relation</label>

                <input
                    id="familyRelation"
                    type="text"
                    placeholder="e.g. Father, Mother"
                    required
                >

            </div>

            <div class="form-group">

                <label>Phone</label>

                <input
                    id="familyPhone"
                    type="tel"
                    placeholder="Phone number"
                >

            </div>

            <button
                type="submit"
                class="primary-button"
            >
                Add Family Member
            </button>

        </form>

        <div style="height:18px"></div>

        <div id="familyList"></div>
    `;

    renderFamily();

    $("familyForm").onsubmit =
        event => {

            event.preventDefault();

            const name =
                $("familyName")
                    .value
                    .trim();

            const relation =
                $("familyRelation")
                    .value
                    .trim();

            const phone =
                $("familyPhone")
                    .value
                    .trim();

            if (!name || !relation) {

                showMessage(
                    "Name and relation are required.",
                    "error"
                );

                return;
            }

            family.unshift({

                id:
                    Date.now(),

                name,

                relation,

                phone
            });

            save(
                "gharLinkFamily",
                family
            );

            $("familyForm").reset();

            renderFamily();

            showMessage(
                "Family member added."
            );
        };

    $("detailModal").classList.add(
        "show"
    );
}


function renderFamily() {

    const list =
        $("familyList");

    if (!list) return;

    if (!family.length) {

        list.innerHTML = `

            <div class="empty-card">

                <div>

                    <strong>
                        No family members
                    </strong>

                    <p>
                        Add a family member above.
                    </p>

                </div>

            </div>
        `;

        return;
    }

    list.innerHTML =
        "";

    family.forEach(member => {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "detail-box";

        card.innerHTML = `

            <strong>
                ${escapeHTML(
                    member.name
                )}
            </strong>

            <span>
                ${escapeHTML(
                    member.relation
                )}
            </span>

            ${
                member.phone
                    ? `
                        <a
                            href="tel:${escapeHTML(
                                member.phone
                            )}"
                            style="
                                color:var(--accent);
                                text-decoration:none;
                                margin-top:6px;
                                display:block;
                            "
                        >
                            ${escapeHTML(
                                member.phone
                            )}
                        </a>
                    `
                    : ""
            }

            <button
                type="button"
                class="secondary-button"
                style="margin-top:10px;"
            >
                Delete
            </button>
        `;

        card.querySelector(
            "button"
        ).onclick =
            () => {

                openConfirm(
                    "Delete Member?",
                    `Delete ${member.name}?`,
                    () => {

                        family =
                            family.filter(
                                m =>
                                    m.id !==
                                    member.id
                            );

                        save(
                            "gharLinkFamily",
                            family
                        );

                        openFamily();

                        showMessage(
                            "Family member deleted."
                        );
                    }
                );
            };

        list.appendChild(card);
    });
}


/* =========================================================
   NOTES
========================================================= */

function openNotes(editNote = null) {

    $("detailTitle").textContent =
        "Notes";

    $("detailContent").innerHTML = `

        <form id="noteForm">

            <input
                type="hidden"
                id="editingNoteId"
                value="${
                    editNote
                        ? editNote.id
                        : ""
                }"
            >

            <div class="form-group">

                <label>Title</label>

                <input
                    id="noteTitle"
                    type="text"
                    placeholder="Note title"
                    value="${
                        editNote
                            ? escapeHTML(
                                editNote.title
                            )
                            : ""
                    }"
                    required
                >

            </div>

            <div class="form-group">

                <label>Note</label>

                <textarea
                    id="noteContent"
                    rows="5"
                    placeholder="Write your note..."
                    required
                >${
                    editNote
                        ? escapeHTML(
                            editNote.content
                        )
                        : ""
                }</textarea>

            </div>

            <button
                type="submit"
                class="primary-button"
            >
                ${
                    editNote
                        ? "Save Changes"
                        : "Add Note"
                }
            </button>

        </form>

        <div style="height:18px"></div>

        <div id="notesList"></div>
    `;

    renderNotes();

    $("noteForm").onsubmit =
        event => {

            event.preventDefault();

            const title =
                $("noteTitle")
                    .value
                    .trim();

            const content =
                $("noteContent")
                    .value
                    .trim();

            const editingId =
                $("editingNoteId")
                    .value;

            if (!title || !content) {

                showMessage(
                    "Please complete the note.",
                    "error"
                );

                return;
            }

            if (editingId) {

                const note =
                    notes.find(
                        n =>
                            n.id ===
                            Number(editingId)
                    );

                if (note) {

                    note.title =
                        title;

                    note.content =
                        content;
                }

                showMessage(
                    "Note updated."
                );

            } else {

                notes.unshift({

                    id:
                        Date.now(),

                    title,

                    content,

                    createdAt:
                        new Date().toISOString()
                });

                showMessage(
                    "Note added."
                );
            }

            save(
                "gharLinkNotes",
                notes
            );

            openNotes();
        };

    $("detailModal").classList.add(
        "show"
    );
}


function renderNotes() {

    const list =
        $("notesList");

    if (!list) return;

    if (!notes.length) {

        list.innerHTML = `

            <div class="empty-card">

                <div>

                    <strong>
                        No notes yet
                    </strong>

                    <p>
                        Create your first note above.
                    </p>

                </div>

            </div>
        `;

        return;
    }

    list.innerHTML =
        "";

    notes.forEach(note => {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "detail-box";

        card.innerHTML = `

            <strong>
                ${escapeHTML(
                    note.title
                )}
            </strong>

            <span>
                ${escapeHTML(
                    note.content
                )}
            </span>

            <div style="
                display:flex;
                gap:8px;
                margin-top:12px;
            ">

                <button
                    type="button"
                    class="secondary-button"
                >
                    Edit
                </button>

                <button
                    type="button"
                    class="secondary-button danger"
                >
                    Delete
                </button>

            </div>
        `;

        const buttons =
            card.querySelectorAll(
                "button"
            );

        buttons[0].onclick =
            () => openNotes(note);

        buttons[1].onclick =
            () => {

                openConfirm(
                    "Delete Note?",
                    `Delete "${note.title}"?`,
                    () => {

                        notes =
                            notes.filter(
                                n =>
                                    n.id !==
                                    note.id
                            );

                        save(
                            "gharLinkNotes",
                            notes
                        );

                        openNotes();

                        showMessage(
                            "Note deleted."
                        );
                    }
                );
            };

        list.appendChild(card);
    });
}


/* =========================================================
   USEFUL LINKS
========================================================= */

function openLinks() {

    $("detailTitle").textContent =
        "Useful Links";

    $("detailContent").innerHTML = `

        <form id="linkForm">

            <div class="form-group">

                <label>Name</label>

                <input
                    id="linkName"
                    type="text"
                    placeholder="Website name"
                    required
                >

            </div>

            <div class="form-group">

                <label>URL</label>

                <input
                    id="linkURL"
                    type="url"
                    placeholder="https://example.com"
                    required
                >

            </div>

            <button
                type="submit"
                class="primary-button"
            >
                Add Link
            </button>

        </form>

        <div style="height:18px"></div>

        <div id="linksList"></div>
    `;

    renderLinks();

    $("linkForm").onsubmit =
        event => {

            event.preventDefault();

            const name =
                $("linkName")
                    .value
                    .trim();

            let url =
                $("linkURL")
                    .value
                    .trim();

            if (!name || !url) {

                showMessage(
                    "Please complete both fields.",
                    "error"
                );

                return;
            }

            if (
                !url.startsWith("http://") &&
                !url.startsWith("https://")
            ) {

                showMessage(
                    "URL must start with http:// or https://.",
                    "error"
                );

                return;
            }

            links.unshift({

                id:
                    Date.now(),

                name,

                url
            });

            save(
                "gharLinkLinks",
                links
            );

            $("linkForm").reset();

            renderLinks();

            showMessage(
                "Useful link added."
            );
        };

    $("detailModal").classList.add(
        "show"
    );
}


function renderLinks() {

    const list =
        $("linksList");

    if (!list) return;

    if (!links.length) {

        list.innerHTML = `

            <div class="empty-card">

                <div>

                    <strong>
                        No useful links
                    </strong>

                    <p>
                        Add an important website above.
                    </p>

                </div>

            </div>
        `;

        return;
    }

    list.innerHTML =
        "";

    links.forEach(link => {

        const card =
            document.createElement(
                "div"
            );

        card.className =
            "detail-box";

        card.innerHTML = `

            <strong>
                ${escapeHTML(
                    link.name
                )}
            </strong>

            <a
                href="${escapeHTML(
                    link.url
                )}"
                target="_blank"
                rel="noopener noreferrer"
                style="
                    color:var(--accent);
                    text-decoration:none;
                    word-break:break-all;
                    display:block;
                    margin-top:6px;
                "
            >
                ${escapeHTML(
                    link.url
                )}
            </a>

            <button
                type="button"
                class="secondary-button danger"
                style="margin-top:10px;"
            >
                Delete
            </button>
        `;

        card.querySelector(
            "button"
        ).onclick =
            () => {

                openConfirm(
                    "Delete Link?",
                    `Delete "${link.name}"?`,
                    () => {

                        links =
                            links.filter(
                                l =>
                                    l.id !==
                                    link.id
                            );

                        save(
                            "gharLinkLinks",
                            links
                        );

                        openLinks();

                        showMessage(
                            "Link deleted."
                        );
                    }
                );
            };

        list.appendChild(card);
    });
}


/* =========================================================
   SETTINGS
========================================================= */

function openSettings() {

    $("detailTitle").textContent =
        "Settings";

    $("detailContent").innerHTML = `

        <div class="settings-section">

            <div class="section-title">
                <h2>Appearance</h2>
            </div>

            <div class="theme-options">

                <button
                    type="button"
                    class="theme-option ${
                        theme === "light"
                            ? "active"
                            : ""
                    }"
                    id="lightThemeButton"
                >

                    <svg>
                        <use href="#icon-sun"></use>
                    </svg>

                    <span>
                        Light
                    </span>

                </button>

                <button
                    type="button"
                    class="theme-option ${
                        theme === "dark"
                            ? "active"
                            : ""
                    }"
                    id="darkThemeButton"
                >

                    <svg>
                        <use href="#icon-moon"></use>
                    </svg>

                    <span>
                        Dark
                    </span>

                </button>

            </div>

        </div>
    `;

    $("lightThemeButton").onclick =
        () => setTheme("light");

    $("darkThemeButton").onclick =
        () => setTheme("dark");

    $("detailModal").classList.add(
        "show"
    );
}


function setTheme(newTheme) {

    theme =
        newTheme;

    localStorage.setItem(
        "gharLinkTheme",
        theme
    );

    applyTheme();

    openSettings();

    showMessage(
        theme === "dark"
            ? "Dark mode enabled."
            : "Light mode enabled."
    );
}


function applyTheme() {

    document.body.classList.toggle(
        "dark",
        theme === "dark"
    );

    const meta =
        document.querySelector(
            'meta[name="theme-color"]'
        );

    if (meta) {

        meta.setAttribute(
            "content",
            theme === "dark"
                ? "#151516"
                : "#F2F2F4"
        );
    }
}

applyTheme();


/* =========================================================
   ABOUT
========================================================= */

function openAbout() {

    $("detailTitle").textContent =
        "About";

    $("detailContent").innerHTML = `

        <div class="about-card">

            <h3>
                GharLink
            </h3>

            <p>
                GharLink is a simple family utility
                app designed to keep everyday
                household tasks, notes, bills,
                contacts and useful links in one place.
            </p>

            <div class="about-divider"></div>

            <p class="developer-name">
                Sayyed Sahil
            </p>

            <p>
                BCA Student — Designed & Developed
                this project using HTML, CSS & JavaScript.
            </p>

            <p>
                Built as a learning project with a
                focus on simplicity and everyday usefulness.
            </p>

        </div>
    `;

    $("detailModal").classList.add(
        "show"
    );
}


/* =========================================================
   DETAIL MODAL CLOSE
========================================================= */

$("closeDetailModal").addEventListener(
    "click",
    () => {

        $("detailModal").classList.remove(
            "show"
        );

    }
);


$("detailModal").addEventListener(
    "click",
    event => {

        if (
            event.target ===
            $("detailModal")
        ) {

            $("detailModal").classList.remove(
                "show"
            );
        }

    }
);


/* =========================================================
   FORMAT MONEY
========================================================= */

function formatMoney(value) {

    return Number(
        value
    ).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );

    div.textContent =
        String(
            value ?? ""
        );

    return div.innerHTML;
}


/* =========================================================
   START APP
========================================================= */

renderTasks();

renderBills();

updateHome();

showScreen(
    "homeScreen"
);
