const $ = (id) =>
    document.getElementById(id);


/*  STORAGE */

function loadData(key, fallback = []) {

    try {

        const data =
            localStorage.getItem(key);

        return data
            ? JSON.parse(data)
            : fallback;

    } catch {

        return fallback;
    }
}


let tasks =
    loadData("gharLinkTasks");

let bills =
    loadData("gharLinkBills");

let family =
    loadData("gharLinkFamily");

let notes =
    loadData("gharLinkNotes");

let links =
    loadData("gharLinkLinks");


let theme =
    localStorage.getItem(
        "gharLinkTheme"
    ) || "light";


let currentProducts = [];

let editingBillId = null;


/*  SAVE */

function save(key, value) {

    localStorage.setItem(
        key,
        JSON.stringify(value)
    );
}


/*  SMALL MESSAGE */

function showMessage(
    message,
    type = "success"
) {

    let toast =
        document.getElementById(
            "gharLinkToast"
        );


    if (!toast) {

        toast =
            document.createElement(
                "div"
            );

        toast.id =
            "gharLinkToast";

        toast.style.cssText = `
            position:fixed;
            left:50%;
            bottom:82px;
            transform:
                translateX(-50%)
                translateY(20px);

            width:calc(100% - 32px);
            max-width:420px;

            padding:14px 16px;

            border-radius:16px;

            background:var(--card);
            color:var(--text);

            border:1px solid var(--border);

            box-shadow:
                0 12px 35px rgba(0,0,0,.18);

            display:flex;
            align-items:center;

            gap:10px;

            z-index:9999;

            opacity:0;

            transition:.25s ease;

            font-size:14px;
            font-weight:600;
        `;

        document.body.appendChild(
            toast
        );
    }


    toast.innerHTML = `
        <span style="
            width:9px;
            height:9px;
            border-radius:50%;
            background:
                ${
                    type === "error"
                        ? "#EF4444"
                        : "#10B981"
                };
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


/*  CUSTOM CONFIRM */

function openConfirm(
    title,
    message,
    onConfirm
) {

    const modal =
        $("detailModal");


    $("detailTitle")
        .textContent = title;


    $("detailContent")
        .innerHTML = `

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
                style="
                    background:#EF4444;
                    margin-top:0;
                "
            >
                Delete
            </button>

        </div>
    `;


    modal.classList.add("show");


    $("cancelConfirm").onclick =
        () => {

            modal.classList.remove(
                "show"
            );
        };


    $("acceptConfirm").onclick =
        () => {

            modal.classList.remove(
                "show"
            );

            onConfirm();
        };
}


/*  NAVIGATION */

const screens =
    document.querySelectorAll(
        ".screen"
    );

const navItems =
    document.querySelectorAll(
        ".nav-item"
    );

const quickCards =
    document.querySelectorAll(
        ".quick-card"
    );


function showScreen(
    screenId
) {

    screens.forEach(
        screen => {

            screen.classList.remove(
                "active"
            );
        }
    );


    const screen =
        $(screenId);


    if (screen) {

        screen.classList.add(
            "active"
        );
    }


    navItems.forEach(
        item => {

            item.classList.toggle(
                "active",
                item.dataset.screen ===
                    screenId
            );
        }
    );


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    updateHome();
}


navItems.forEach(
    item => {

        item.addEventListener(
            "click",
            () => {

                showScreen(
                    item.dataset.screen
                );
            }
        );
    }
);


quickCards.forEach(
    card => {

        card.addEventListener(
            "click",
            () => {

                showScreen(
                    card.dataset.screen
                );
            }
        );
    }
);


/*  DATE */

function updateDate() {

    const date =
        new Date();


    $("currentDate")
        .textContent =
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


/* TASKS */

function openTaskModal(
    task = null
) {

    $("taskModal")
        .classList.add("show");


    if (task) {

        $("taskModalTitle")
            .textContent =
            "Edit Task";


        $("taskSubmitText")
            .textContent =
            "Save Changes";


        $("editingTaskId")
            .value = task.id;


        $("taskName")
            .value = task.name;


        $("taskDeadline")
            .value =
            task.deadline;

    } else {

        $("taskModalTitle")
            .textContent =
            "Add Task";


        $("taskSubmitText")
            .textContent =
            "Add Task";


        $("editingTaskId")
            .value = "";


        $("taskName")
            .value = "";


        const today =
            new Date();


        today.setMinutes(
            today.getMinutes() -
            today.getTimezoneOffset()
        );


        $("taskDeadline")
            .value =
            today
                .toISOString()
                .split("T")[0];
    }


    setTimeout(() => {

        $("taskName").focus();

    }, 100);
}


function closeTaskModal() {

    $("taskModal")
        .classList.remove(
            "show"
        );


    $("taskForm").reset();


    $("editingTaskId")
        .value = "";
}


$("addTaskButton")
    .addEventListener(
        "click",
        () => openTaskModal()
    );


$("closeTaskModal")
    .addEventListener(
        "click",
        closeTaskModal
    );


$("taskModal")
    .addEventListener(
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


$("taskForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const name =
                $("taskName")
                    .value
                    .trim();


            const deadline =
                $("taskDeadline")
                    .value;


            const editingId =
                $("editingTaskId")
                    .value;


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


                if (task) {

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
                }

            } else {

                tasks.unshift({

                    id:
                        Date.now(),

                    name,

                    deadline,

                    completed:
                        false,

                    createdAt:
                        new Date()
                            .toISOString(),

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


function formatDate(
    value
) {

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


function getDeadlineText(
    task
) {

    if (task.completed) {

        if (task.completedAt) {

            const date =
                new Date(
                    task.completedAt
                );


            return `
                Completed •
                ${date.toLocaleDateString(
                    "en-IN",
                    {
                        day: "numeric",
                        month: "short"
                    }
                )}
            `;
        }


        return "Completed";
    }


    if (isOverdue(task)) {

        return `
            Overdue •
            ${formatDate(
                task.deadline
            )}
        `;
    }


    return `
        Pending • Due
        ${formatDate(
            task.deadline
        )}
    `;
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
                    <strong>
                        No tasks added
                    </strong>

                    <p>
                        Add your first household task.
                    </p>
                </div>

            </div>
        `;


        updateTaskCounts();

        return;
    }


    list.innerHTML = `

        <div class="task-list"></div>
    `;


    const taskList =
        list.querySelector(
            ".task-list"
        );


    tasks.forEach(
        task => {

            const item =
                document.createElement(
                    "div"
                );


            item.className = `
                task-item
                ${
                    task.completed
                        ? "completed"
                        : ""
                }
                ${
                    isOverdue(task)
                        ? "overdue"
                        : ""
                }
            `;


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
                () =>
                    toggleTask(
                        task.id
                    );


            item.querySelector(
                ".edit-task"
            ).onclick =
                () =>
                    editTask(
                        task.id
                    );


            item.querySelector(
                ".delete-task"
            ).onclick =
                () =>
                    deleteTask(
                        task.id
                    );


            taskList.appendChild(
                item
            );
        }
    );


    updateTaskCounts();
}


function updateTaskCounts() {

    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;


    $("taskCount")
        .textContent =
        tasks.length;


    $("completedCount")
        .textContent =
        completed;
}


/*  BILLS */

function resetBillForm() {

    currentProducts = [];

    editingBillId = null;


    $("billCustomerName")
        .value = "";


    $("productName")
        .value = "";


    $("productQty")
        .value = 1;


    $("productPrice")
        .value = "";


    renderBillProducts();
}


function openBillModal(
    bill = null
) {

    $("billModal")
        .classList.add("show");


    if (bill) {

        editingBillId =
            bill.id;


        $("billModalTitle")
            .textContent =
            "Edit Bill";


        $("saveBillText")
            .textContent =
            "Save Changes";


        $("billCustomerName")
            .value =
            bill.customerName ||
            "";


        currentProducts =
            (bill.products || [])
                .map(
                    product => ({
                        id:
                            product.id ||
                            Date.now() +
                            Math.random(),

                        name:
                            product.name,

                        quantity:
                            Number(
                                product.quantity
                            ),

                        price:
                            Number(
                                product.price
                            ),

                        total:
                            Number(
                                product.total
                            )
                    })
                );

    } else {

        editingBillId =
            null;


        $("billModalTitle")
            .textContent =
            "Create Bill";


        $("saveBillText")
            .textContent =
            "Save Bill";


        resetBillForm();
    }


    renderBillProducts();


    setTimeout(() => {

        $("billCustomerName")
            .focus();

    }, 100);
}


function closeBillModal() {

    $("billModal")
        .classList.remove(
            "show"
        );


    resetBillForm();


    $("billForm").reset();


    $("productQty")
        .value = 1;


    renderBillProducts();
}


$("createBillButton")
    .addEventListener(
        "click",
        () => openBillModal()
    );


$("closeBillModal")
    .addEventListener(
        "click",
        closeBillModal
    );


$("billModal")
    .addEventListener(
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


$("addProductButton")
    .addEventListener(
        "click",
        addProduct
    );


function addProduct() {

    const name =
        $("productName")
            .value
            .trim();


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
            Math.random(),

        name,

        quantity,

        price,

        total:
            quantity * price

    });


    $("productName")
        .value = "";


    $("productQty")
        .value = 1;


    $("productPrice")
        .value = "";


    renderBillProducts();


    $("productName")
        .focus();
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


/*  BILL PRODUCTS UI */

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

        container.innerHTML = "";


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
                            ${
                                product.quantity
                            }
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


    $("currentBillTotal")
        .textContent =
        `₹${formatMoney(
            getBillTotal()
        )}`;
}


/* SAVE / UPDATE BILL */

$("billForm")
    .addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const customerName =
                $("billCustomerName")
                    .value
                    .trim();


            if (!customerName) {

                showMessage(
                    "Please enter the customer's name.",
                    "error"
                );

                $("billCustomerName")
                    .focus();

                return;
            }


            if (
                !currentProducts.length
            ) {

                showMessage(
                    "Add at least one product first.",
                    "error"
                );

                return;
            }


            const total =
                getBillTotal();


            /* EDIT EXISTING BILL */

            if (editingBillId) {

                const bill =
                    bills.find(
                        item =>
                            item.id ===
                            editingBillId
                    );


                if (bill) {

                    bill.customerName =
                        customerName;


                    bill.products =
                        [...currentProducts];


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
            }


            /* CREATE NEW BILL */

            const now =
                Date.now();


            const bill = {

                id:
                    now,

                billNumber:
                    "GL-" +
                    String(now)
                        .slice(-6),

                customerName,

                products:
                    [...currentProducts],

                total,

                createdAt:
                    new Date()
                        .toISOString()

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


/* BILLS RENDER */

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

                    <strong>
                        No bills yet
                    </strong>

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


    bills.forEach(
        bill => {

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


            const customer =
                bill.customerName ||
                "Customer name not available";


            card.innerHTML = `

                <div class="bill-card-icon">

                    <svg>
                        <use href="#icon-receipt"></use>
                    </svg>

                </div>


                <div class="bill-card-info">

                    <strong>
                        ${escapeHTML(
                            customer
                        )}
                    </strong>


                    <span>

                        ${escapeHTML(
                            bill.billNumber
                        )}

                        •

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
                () =>
                    openBillDetails(
                        bill
                    );


            list.appendChild(
                card
            );
        }
    );


    updateBillStats();
}


function updateBillStats() {

    $("billCount")
        .textContent =
        bills.length;


    const total =
        bills.reduce(
            (sum, bill) =>
                sum +
                Number(
                    bill.total || 0
                ),

            0
        );


    $("billTotalAmount")
        .textContent =
        `₹${formatMoney(
            total
        )}`;
}


/* BILL DETAILS */

function openBillDetails(
    bill
) {

    $("detailTitle")
        .textContent =
        bill.billNumber;


    let productsHTML =
        "";


    (bill.products || [])
        .forEach(
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
                                ${
                                    product.quantity
                                }
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


    const customer =
        bill.customerName ||
        "Customer name not available";


    $("detailContent")
        .innerHTML = `

        <div class="detail-box bill-customer">

            <div>
                <strong>
                    Bill For
                </strong>

                <span>
                    Customer Name
                </span>
            </div>


            <span>
                ${escapeHTML(
                    customer
                )}
            </span>

        </div>


        <div class="detail-box">

            <strong>
                Bill Number
            </strong>

            <span>
                ${escapeHTML(
                    bill.billNumber
                )}
            </span>

        </div>


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
                class="secondary-button"
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
                id="downloadBillButton"
            >
                <svg>
                    <use href="#icon-download"></use>
                </svg>

                PDF
            </button>


            <button
                type="button"
                class="secondary-button"
                id="shareBillButton"
            >
                <svg>
                    <use href="#icon-share"></use>
                </svg>

                Share
            </button>

        </div>


        <button
            type="button"
            class="secondary-button"
            id="printBillButton"
            style="margin-top:8px;"
        >
            <svg>
                <use href="#icon-print"></use>
            </svg>

            Print
        </button>
    `;


    $("detailModal")
        .classList.add("show");


    $("editBillButton")
        .onclick =
        () => {

            $("detailModal")
                .classList.remove(
                    "show"
                );

            openBillModal(
                bill
            );
        };


    $("deleteBillButton")
        .onclick =
        () =>
            deleteBill(
                bill.id
            );


    $("downloadBillButton")
        .onclick =
        () =>
            downloadBillPDF(
                bill.id
            );


    $("shareBillButton")
        .onclick =
        () =>
            downloadBillPDF(
                bill.id,
                "share"
            );


    $("printBillButton")
        .onclick =
        () =>
            printBill(
                bill.id
            );
}


/*  DELETE BILL */

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


            showMessage(
                "Bill deleted."
            );
        }
    );
}


/*  PDF — HELPERS */

/*
   This creates a real PDF file directly in JavaScript.

   It does NOT depend on the browser's print dialog.
   This is the important mobile fix.
*/


function pdfEscape(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /\(/g,
            "\\("
        )
        .replace(
            /\)/g,
            "\\)"
        );
}


function pdfText(
    text,
    x,
    y,
    size = 10,
    font = "F1"
) {

    return `
BT
/${font} ${size} Tf
${x} ${y} Td
(${pdfEscape(text)}) Tj
ET
`;
}


function createSimplePDF(
    lines
) {

    const pageWidth =
        595;

    const pageHeight =
        842;


    const contentParts = [];


    contentParts.push(
        "1 0 0 1 0 0 cm"
    );


    let y =
        pageHeight - 50;


    lines.forEach(
        line => {

            contentParts.push(
                pdfText(
                    line.text,
                    line.x ?? 40,
                    line.y ?? y,
                    line.size ?? 10,
                    line.font ?? "F1"
                )
            );


            y -=
                line.gap ?? 16;
        }
    );


    const content =
        contentParts.join(
            "\n"
        );


    const objects = [];


    objects[1] = `
<<
/Type /Catalog
/Pages 2 0 R
>>
`;


    objects[2] = `
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
`;


    objects[3] = `
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 ${pageWidth} ${pageHeight}]
/Resources <<
    /Font <<
        /F1 5 0 R
    >>
>>
/Contents 4 0 R
>>
`;


    objects[4] = `
<<
/Length ${content.length}
>>
stream
${content}
endstream
`;


    objects[5] = `
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
`;


    let pdf =
        "%PDF-1.4\n";


    const offsets =
        [0];


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        offsets[i] =
            pdf.length;


        pdf +=
            `${i} 0 obj\n`;


        pdf +=
            objects[i];


        pdf +=
            "\nendobj\n";
    }


    const xrefOffset =
        pdf.length;


    pdf +=
        "xref\n";


    pdf +=
        "0 6\n";


    pdf +=
        "0000000000 65535 f \n";


    for (
        let i = 1;
        i <= 5;
        i++
    ) {

        pdf +=
            String(
                offsets[i]
            ).padStart(
                10,
                "0"
            ) +
            " 00000 n \n";
    }


    pdf +=
        "trailer\n";


    pdf += `
<<
/Size 6
/Root 1 0 R
>>
`;


    pdf +=
        "startxref\n";


    pdf +=
        xrefOffset +
        "\n";


    pdf +=
        "%%EOF";


    return pdf;
}


/* DOWNLOAD BILL PDF */

async function downloadBillPDF(
    id,
    mode = "download"
) {

    const bill =
        bills.find(
            item =>
                item.id === id
        );


    if (!bill) return;


    const customer =
        bill.customerName ||
        "Customer name not available";


    const date =
        new Date(
            bill.createdAt
        );


    const fileName =
        `${sanitizeFileName(
            bill.billNumber
        )}.pdf`;


    if (
        typeof html2canvas !== "function" ||
        !window.jspdf ||
        typeof window.jspdf.jsPDF !== "function"
    ) {
        showMessage(
            "PDF tools are still loading. Please try again.",
            "error"
        );
        return;
    }


    const productsHTML =
        (bill.products || [])
            .map(
                product => `
                    <tr>
                        <td class="pdf-product-name">
                            ${escapeHTML(product.name)}
                        </td>
                        <td>
                            ${escapeHTML(product.quantity)}
                        </td>
                        <td>
                            Rs. ${formatMoney(product.price)}
                        </td>
                        <td>
                            Rs. ${formatMoney(product.total)}
                        </td>
                    </tr>
                `
            )
            .join("");


    const pdfDate =
        date.toLocaleDateString(
            "en-IN",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    const wrapper =
        document.createElement("div");


    wrapper.style.cssText = `
        position: fixed;
        left: -10000px;
        top: 0;
        width: 794px;
        min-height: 1123px;
        box-sizing: border-box;
        padding: 58px 60px 52px;
        background: #ffffff;
        color: #222222;
        font-family: Arial, "Segoe UI Emoji", "Noto Color Emoji", sans-serif;
        font-size: 16px;
        line-height: 1.45;
        z-index: -1;
    `;


    wrapper.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
            <div>
                <div style="font-size:34px;font-weight:400;line-height:1.1;">
                    GharLink
                </div>
                <div style="font-size:14px;margin-top:12px;">
                    Everything. One Place.
                </div>
            </div>

            <div style="font-size:25px;font-weight:400;">
                BILL
            </div>
        </div>

        <div style="margin-top:34px;font-size:16px;line-height:1.8;">
            <div>Bill Number: ${escapeHTML(bill.billNumber)}</div>
            <div>Date: ${escapeHTML(pdfDate)}</div>
            <div>Bill For: ${escapeHTML(customer)}</div>
        </div>

        <div style="border-top:1px dashed #555;margin-top:25px;padding-top:15px;">
            <table style="width:100%;border-collapse:collapse;table-layout:fixed;">
                <colgroup>
                    <col style="width:52%;">
                    <col style="width:11%;">
                    <col style="width:18%;">
                    <col style="width:19%;">
                </colgroup>
                <thead>
                    <tr>
                        <th style="text-align:left;font-weight:400;padding:0 0 12px;">Product</th>
                        <th style="text-align:left;font-weight:400;padding:0 0 12px;">Qty</th>
                        <th style="text-align:left;font-weight:400;padding:0 0 12px;">Price</th>
                        <th style="text-align:left;font-weight:400;padding:0 0 12px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${productsHTML}
                </tbody>
            </table>
        </div>

        <div style="border-top:1px dashed #555;margin-top:16px;padding-top:18px;text-align:right;font-size:20px;">
            Grand Total: Rs. ${formatMoney(bill.total)}
        </div>

        <div style="position:absolute;left:60px;bottom:55px;font-size:13px;">
            Generated by GharLink
        </div>

        <style>
            .pdf-product-name {
                overflow-wrap:anywhere;
                word-break:break-word;
            }
            table td {
                padding:8px 0;
                vertical-align:top;
                font-size:14px;
                font-weight:400;
            }
        </style>
    `;


    document.body.appendChild(wrapper);


    try {
        if (document.fonts && document.fonts.ready) {
            await document.fonts.ready;
        }

        await new Promise(resolve =>
            setTimeout(resolve, 120)
        );


        // Render at a high resolution so the exported PDF stays sharper
        // when zoomed. The previous scale of 2 caused visible pixelation.
        const renderScale = Math.min(4, Math.max(3, window.devicePixelRatio || 1));

        const canvas =
            await html2canvas(
                wrapper,
                {
                    scale: renderScale,
                    backgroundColor: "#ffffff",
                    useCORS: true,
                    allowTaint: false,
                    logging: false,
                    imageTimeout: 0,
                    width: wrapper.scrollWidth,
                    height: wrapper.scrollHeight,
                    windowWidth: wrapper.scrollWidth,
                    windowHeight: wrapper.scrollHeight
                }
            );


        const { jsPDF } =
            window.jspdf;


        const pdf =
            new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: "a4",
                compress: true
            });


        const imageData =
            canvas.toDataURL(
                "image/png"
            );


        pdf.addImage(
            imageData,
            "PNG",
            0,
            0,
            210,
            297,
            undefined,
            "NONE"
        );


        const blob =
            pdf.output("blob");


        if (
            mode === "share" &&
            navigator.share &&
            navigator.canShare
        ) {
            const file =
                new File(
                    [blob],
                    fileName,
                    {
                        type: "application/pdf"
                    }
                );


            if (
                navigator.canShare({
                    files: [file]
                })
            ) {
                try {
                    await navigator.share({
                        title: fileName,
                        text: "GharLink bill",
                        files: [file]
                    });

                    showMessage(
                        "Share menu opened."
                    );
                    return;
                } catch (error) {
                    if (
                        error &&
                        error.name === "AbortError"
                    ) {
                        return;
                    }
                }
            }
        }


        downloadPDFBlob(
            blob,
            fileName
        );
    } catch (error) {
        console.error(
            "GharLink PDF generation failed:",
            error
        );

        showMessage(
            "Unable to generate PDF. Please try again.",
            "error"
        );
    } finally {
        wrapper.remove();
    }
}


function downloadPDFBlob(
    blob,
    fileName
) {

    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;
    link.download = fileName;
    link.style.display = "none";


    document.body.appendChild(
        link
    );

    link.click();
    link.remove();


    setTimeout(() => {
        URL.revokeObjectURL(
            url
        );
    }, 1000);


    showMessage(
        "PDF download started."
    );
}


/* PRINT BILL */

function printBill(
    id
) {

    const bill =
        bills.find(
            item =>
                item.id === id
        );


    if (!bill) return;


    let rows = "";


    (bill.products || [])
        .forEach(
            product => {

                rows += `

                    <tr>

                        <td>
                            ${escapeHTML(
                                product.name
                            )}
                        </td>

                        <td>
                            ${
                                product.quantity
                            }
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


    const customer =
        bill.customerName ||
        "Customer name not available";


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

                * {
                    box-sizing:border-box;
                }

                body {
                    font-family:
                        Arial,
                        sans-serif;

                    padding:30px;

                    color:#222;

                    max-width:800px;

                    margin:auto;
                }

                h1 {
                    margin:0 0 4px;
                }

                .tagline {
                    color:#777;
                    margin:0 0 25px;
                }

                .customer {
                    border:1px solid #ddd;
                    padding:14px;
                    border-radius:8px;
                    margin-bottom:20px;
                }

                .customer strong {
                    display:block;
                    margin-bottom:5px;
                }

                .meta {
                    color:#666;
                    margin:5px 0;
                }

                table {
                    width:100%;
                    border-collapse:collapse;
                    margin-top:20px;
                }

                th,
                td {
                    padding:10px;
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

                @media print {
                    body {
                        padding:0;
                    }
                }

            </style>

        </head>


        <body>

            <h1>
                GharLink
            </h1>

            <p class="tagline">
                Everything. One Place.
            </p>


            <div class="customer">

                <strong>
                    Bill For
                </strong>

                <div>
                    ${escapeHTML(
                        customer
                    )}
                </div>

            </div>


            <p class="meta">
                <strong>
                    Bill Number:
                </strong>

                ${escapeHTML(
                    bill.billNumber
                )}
            </p>


            <p class="meta">

                <strong>
                    Date:
                </strong>

                ${new Date(
                    bill.createdAt
                ).toLocaleDateString(
                    "en-IN",
                    {
                        day:"numeric",
                        month:"long",
                        year:"numeric"
                    }
                )}

            </p>


            <table>

                <thead>

                    <tr>

                        <th>
                            Product
                        </th>

                        <th>
                            Qty
                        </th>

                        <th>
                            Price
                        </th>

                        <th>
                            Total
                        </th>

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
        () => {

            printWindow.print();

        },
        300
    );
}


/* HOME */

function updateHome() {

    const completed =
        tasks.filter(
            task =>
                task.completed
        ).length;


    const pending =
        tasks.length -
        completed;


    $("homeTotalTasks")
        .textContent =
        tasks.length;


    $("homePendingTasks")
        .textContent =
        pending;


    $("homeCompletedTasks")
        .textContent =
        completed;


    $("homeTotalBills")
        .textContent =
        bills.length;


    renderHomeTasks();

    renderHomeBills();
}


/* HOME TASKS */

function renderHomeTasks() {

    const container =
        $("homeTasks");


    const recent =
        tasks.slice(
            0,
            3
        );


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


    recent.forEach(
        task => {

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
                () =>
                    toggleTask(
                        task.id
                    );


            list.appendChild(
                item
            );
        }
    );
}


/* HOME BILLS */

function renderHomeBills() {

    const container =
        $("homeBills");


    const recent =
        bills.slice(
            0,
            3
        );


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


    recent.forEach(
        bill => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "bill-card";


            const customer =
                bill.customerName ||
                "Customer name not available";


            card.innerHTML = `

                <div class="bill-card-icon">

                    <svg>
                        <use href="#icon-receipt"></use>
                    </svg>

                </div>


                <div class="bill-card-info">

                    <strong>
                        ${escapeHTML(
                            customer
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            bill.billNumber
                        )}

                        •

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
                () =>
                    openBillDetails(
                        bill
                    );


            list.appendChild(
                card
            );
        }
    );
}


/* MORE */

document
    .querySelectorAll(
        ".more-item"
    )
    .forEach(
        item => {

            item.addEventListener(
                "click",
                () => {

                    openMoreSection(
                        item.dataset.more
                    );
                }
            );
        }
    );


function openMoreSection(
    type
) {

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

        return;
    }
}


/*  FAMILY */

function openFamily() {

    $("detailTitle")
        .textContent =
        "Family";


    $("detailContent")
        .innerHTML = `

        <form id="familyForm">

            <label>
                Name
            </label>

            <input
                id="familyName"
                type="text"
                placeholder="Family member name"
                required
            >


            <label>
                Relation
            </label>

            <input
                id="familyRelation"
                type="text"
                placeholder="e.g. Father, Mother"
                required
            >


            <label>
                Phone
            </label>

            <input
                id="familyPhone"
                type="tel"
                placeholder="Phone number"
            >


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


    $("familyForm")
        .onsubmit =
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


            if (
                !name ||
                !relation
            ) {

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


            $("familyForm")
                .reset();


            renderFamily();


            showMessage(
                "Family member added."
            );
        };


    $("detailModal")
        .classList.add(
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


    list.innerHTML = "";


    family.forEach(
        member => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "detail-box";


            const phone =
                escapeHTML(
                    member.phone ||
                    ""
                );


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
                                href="tel:${phone}"
                                style="
                                    color:var(--accent);
                                    text-decoration:none;
                                    margin-top:6px;
                                    display:block;
                                "
                            >
                                ${phone}
                            </a>
                        `
                        : ""
                }


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
                        "Delete Member?",
                        `Delete ${member.name}?`,
                        () => {

                            family =
                                family.filter(
                                    item =>
                                        item.id !==
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


            list.appendChild(
                card
            );
        }
    );
}


/* NOTES */

function openNotes(
    editNote = null
) {

    $("detailTitle")
        .textContent =
        "Notes";


    $("detailContent")
        .innerHTML = `

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


            <label>
                Title
            </label>

            <input
                id="noteTitle"
                type="text"
                placeholder="Note title"
                required
            >


            <label>
                Note
            </label>

            <textarea
                id="noteContent"
                rows="5"
                placeholder="Write your note..."
                required
            ></textarea>


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


    if (editNote) {

        $("noteTitle")
            .value =
            editNote.title;


        $("noteContent")
            .value =
            editNote.content;
    }


    renderNotes();


    $("noteForm")
        .onsubmit =
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


            if (
                !title ||
                !content
            ) {

                showMessage(
                    "Please complete the note.",
                    "error"
                );

                return;
            }


            if (editingId) {

                const note =
                    notes.find(
                        item =>
                            item.id ===
                            Number(
                                editingId
                            )
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
                        new Date()
                            .toISOString()

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


    $("detailModal")
        .classList.add(
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


    list.innerHTML = "";


    notes.forEach(
        note => {

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
                () =>
                    openNotes(
                        note
                    );


            buttons[1].onclick =
                () => {

                    openConfirm(
                        "Delete Note?",
                        `Delete "${note.title}"?`,
                        () => {

                            notes =
                                notes.filter(
                                    item =>
                                        item.id !==
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


            list.appendChild(
                card
            );
        }
    );
}


/*  USEFUL LINKS */

function openLinks() {

    $("detailTitle")
        .textContent =
        "Useful Links";


    $("detailContent")
        .innerHTML = `

        <form id="linkForm">

            <label>
                Name
            </label>

            <input
                id="linkName"
                type="text"
                placeholder="Website name"
                required
            >


            <label>
                URL
            </label>

            <input
                id="linkURL"
                type="url"
                placeholder="https://example.com"
                required
            >


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


    $("linkForm")
        .onsubmit =
        event => {

            event.preventDefault();


            const name =
                $("linkName")
                    .value
                    .trim();


            const url =
                $("linkURL")
                    .value
                    .trim();


            if (
                !name ||
                !url
            ) {

                showMessage(
                    "Please complete both fields.",
                    "error"
                );

                return;
            }


            if (
                !url.startsWith(
                    "http://"
                ) &&
                !url.startsWith(
                    "https://"
                )
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


            $("linkForm")
                .reset();


            renderLinks();


            showMessage(
                "Useful link added."
            );
        };


    $("detailModal")
        .classList.add(
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


    list.innerHTML = "";


    links.forEach(
        link => {

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
                                    item =>
                                        item.id !==
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


            list.appendChild(
                card
            );
        }
    );
}


/* SETTINGS */

function openSettings() {

    $("detailTitle")
        .textContent =
        "Settings";


    $("detailContent")
        .innerHTML = `

        <div class="settings-section">

            <div class="section-title">

                <h2>
                    Appearance
                </h2>

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


    $("lightThemeButton")
        .onclick =
        () =>
            setTheme(
                "light"
            );


    $("darkThemeButton")
        .onclick =
        () =>
            setTheme(
                "dark"
            );


    $("detailModal")
        .classList.add(
            "show"
        );
}


function setTheme(
    newTheme
) {

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

    document.body
        .classList.toggle(
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


/* ABOUT */

function openAbout() {

    $("detailTitle")
        .textContent =
        "About";


    $("detailContent")
        .innerHTML = `

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


    $("detailModal")
        .classList.add(
            "show"
        );
}


/* DETAIL MODAL CLOSE */

$("closeDetailModal")
    .addEventListener(
        "click",
        () => {

            $("detailModal")
                .classList.remove(
                    "show"
                );
        }
    );


$("detailModal")
    .addEventListener(
        "click",
        event => {

            if (
                event.target ===
                $("detailModal")
            ) {

                $("detailModal")
                    .classList.remove(
                        "show"
                    );
            }
        }
    );


/* FORMAT MONEY */

function formatMoney(
    value
) {

    return Number(
        value || 0
    ).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    );
}


/* FILE NAME CLEANER */

function sanitizeFileName(
    value
) {

    return String(
        value || "GharLink-Bill"
    )
        .replace(
            /[<>:"/\\|?*]+/g,
            "-"
        )
        .trim();
}


/* HTML ESCAPE */

function escapeHTML(
    value
) {

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


/* START APP */

renderTasks();

renderBills();

updateHome();

showScreen(
    "homeScreen"
);
