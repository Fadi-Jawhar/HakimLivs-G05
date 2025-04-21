
const tbody = document.querySelector(".table-body");

const fetchUser = async (id) => {
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`https://hakim-livs-g05-be.vercel.app/api/user/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error("Kunde inte hämta användare");
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Fel vid hämtning av användare:", error);
        return { username: "Okänd", email: "Okänd", lojaltyBonus: false };
    }
};

const fetchOrderHistory = async () => {

    const token = localStorage.getItem("token");
    const response = await fetch("https://hakim-livs-g05-be.vercel.app/api/order", {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    const data = response.ok ? await response.json() : [];
    const rows = await Promise.all(
        data.map(async (order) => {
            const user = await fetchUser(order.user);
            return `
            <tr>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${order._id}</td>
            <td>${order.totalAmount}</td>
            <td>${new Date(order.createdAt).toLocaleString()}</td>
            <td class="${user.lojaltyBonus ? 'text-success' : 'text-danger'}">
            ${user.lojaltyBonus ? 'Trogen kund' : 'Ej trogen kund'}</td>
            </tr>`
            ;
            
        })
    );
    tbody.innerHTML = rows.join("");

}
fetchOrderHistory()

