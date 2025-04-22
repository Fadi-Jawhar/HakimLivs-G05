
const tbody = document.querySelector(".table-body");

const fetchOrderHistory = async () => {
    const token = localStorage.getItem("token");

    const response = await fetch("https://hakim-livs-g05-be.vercel.app/api/order", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    const data = response.ok ? await response.json() : [];
    const rows = data.map((order) => {
        const user = order.user;
        console.log(user)

        return `
            <tr>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${order._id}</td>
                <td>${order.totalAmount}</td>
                <td>${new Date(order.createdAt).toLocaleString()}</td>
                <td class="${user.lojaltyBonus ? 'text-success' : 'text-danger'}">
                    ${user.lojaltyBonus ? 'Trogen kund' : 'Ej trogen kund'}
                </td>
            </tr>`;
    });

    tbody.innerHTML = rows.join("");
};

fetchOrderHistory();


