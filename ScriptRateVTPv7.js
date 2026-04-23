(async () => {
    const totalToProcess = parseInt(prompt("Nhập số đơn cần đánh giá:", "99")) || 0;
    if (totalToProcess <= 0) return;

    const db = document.createElement('div');
    db.style = "position:fixed;top:10px;right:10px;z-index:99999;background:#000;color:#fff;padding:12px;border-radius:8px;font-family:Arial;font-size:13px;border:1px solid #444;box-shadow:0 5px 15px rgba(0,0,0,0.5)";
    db.innerHTML = `<div style="color:#0f0;font-weight:bold">⚡ ĐANG XỬ LÝ...</div><hr>📊 Quét: <span id="t">0</span>/${totalToProcess}`;
    document.body.appendChild(db);

    let counts = { total: 0 };
    const refresh = () => {
        document.getElementById('t').innerText = counts.total;
    };

    const wait = (ms) => new Promise(res => setTimeout(res, ms));

    async function start() {
        await wait(2000);
        const rows = Array.from(document.querySelectorAll('tbody tr'));
        
        if (rows.length === 0) {
            console.warn("Không tìm thấy dữ liệu bảng. Đang chờ...");
            await wait(3000);
            return start();
        }

        for (const row of rows) {
            if (counts.total >= totalToProcess) break;

            try {
                // --- ĐOẠN MỚI THÊM: Đánh dấu dòng đang xử lý ---
                const cb = row.querySelector('input[type="checkbox"]');
                if (cb && !cb.checked) { 
                    cb.click(); 
                    await wait(300); // Đã đổi delay thành wait để khớp với hàm bên trên
                }
                // ----------------------------------------------

                const menuBtn = row.querySelector('.fa-bars') || 
                                row.querySelector('button[mat-icon-button]') || 
                                row.querySelector('.anticon-menu') ||
                                row.querySelector('i[class*="menu"]');

                if (!menuBtn) {
                    console.log("Không thấy nút Menu ở dòng này, bỏ qua...");
                    continue; 
                }
                
                menuBtn.click();
                await wait(1000);

                const allElements = Array.from(document.querySelectorAll('.mat-menu-item, span, button, li'));
                const infoBtn = allElements.find(el => el.textContent.trim().includes("Thông tin bưu tá"));
                
                if (!infoBtn) { 
                    document.body.click(); 
                    counts.total++; refresh(); 
                    continue; 
                }
                infoBtn.click();
                await wait(1500);

                const evalBtn = document.querySelector('.btnEvaluate button') || 
                                Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === "Đánh giá");
                if (evalBtn) { 
                    evalBtn.click(); 
                    await wait(1800); 
                }

                const header = document.querySelector('.title-header');
                if (!(header && header.textContent.includes("Kết quả đánh giá"))) {
                    const star5 = document.querySelector('label[for="star5"]');
                    if (star5) {
                        star5.click();
                        await wait(500);
                        const sendBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes("Gửi"));
                        if (sendBtn) {
                            sendBtn.click();
                            await wait(2000); 
                        }
                    }
                }

                const closeBtn = document.querySelector('.close-btn') || 
                                 document.querySelector('[mat-dialog-close]') || 
                                 document.querySelector('.close') ||
                                 Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes("Đóng"));
                if (closeBtn) closeBtn.click();
                await wait(800);

            } catch (e) { console.log("Lỗi dòng này, tiếp tục..."); }

            counts.total++;
            refresh();
            await wait(1000);
        }

        if (counts.total < totalToProcess) {
            const nextBtn = document.querySelector('.mat-paginator-navigation-next') || 
                            document.querySelector('.ant-pagination-next');
            if (nextBtn && !nextBtn.disabled) {
                nextBtn.click();
                await wait(5000);
                await start();
            } else { finish(); }
        } else { finish(); }
    }

    function finish() {
        db.style.background = "#1a1a1a";
        db.innerHTML = `<b style="color:#0f0">🏁 HOÀN TẤT!</b><hr>📊 Tổng quét: ${counts.total}<br><br><button id="finalClose" style="width:100%;cursor:pointer;padding:5px">ĐÓNG BẢNG</button>`;
        document.getElementById('finalClose').onclick = () => db.remove();
    }

    start();
})();
