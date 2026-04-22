(async () => {
    const userInput = prompt("Nhập tổng số đơn hàng cần đánh giá:", "99");
    const totalToProcess = parseInt(userInput) || 0;
    if (totalToProcess <= 0) return;

    let stats = { success: 0, fail: 0, skipped: 0, total: 0 };
    const delay = (ms) => new Promise(r => setTimeout(r, ms));

    async function processPage() {
        // Chờ bảng dữ liệu ổn định hoàn toàn trước khi quét hàng
        await delay(2000); 
        let rows = document.querySelectorAll('tbody tr');
        
        for (let i = 0; i < rows.length; i++) {
            if (stats.total >= totalToProcess) return;

            const row = rows[i];
            try {
                // 1. Đánh dấu dòng đang xử lý
                const cb = row.querySelector('input[type="checkbox"]');
                if (cb && !cb.checked) { cb.click(); await delay(300); }

                // 2. Tìm nút Menu (Sử dụng Selector linh hoạt hơn để tránh lỗi đỏ)
                const menuBtn = row.querySelector('.fa-bars, button[mat-icon-button], .anticon-menu');
                if (!menuBtn) {
                    // Nếu không thấy nút, bỏ qua âm thầm thay vì báo lỗi đỏ hàng loạt
                    continue; 
                }

                menuBtn.click();
                await delay(800);

                // 3. Chọn Thông tin bưu tá
                const menuItems = document.querySelectorAll('.mat-menu-item, span, button');
                const infoBtn = Array.from(menuItems).find(el => el.textContent.includes("Thông tin bưu tá"));
                if (infoBtn) {
                    infoBtn.click();
                    await delay(1200);
                }

                // 4. Click nút Đánh giá
                const evalBtn = document.querySelector('.btnEvaluate button') || 
                                Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === "Đánh giá");
                if (evalBtn) {
                    evalBtn.click();
                    await delay(1500);
                }

                // 5. Kiểm tra kết quả
                const header = document.querySelector('.title-header');
                if (header && header.textContent.includes("Kết quả đánh giá dịch vụ")) {
                    stats.skipped++;
                    const close = document.querySelector('.close-btn') || document.querySelector('button.close');
                    if (close) close.click();
                } else {
                    const star5 = document.querySelector('label[for="star5"]');
                    if (star5) {
                        star5.click();
                        await delay(500);
                        const send = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes("Gửi"));
                        if (send) { send.click(); stats.success++; }
                    }
                    await delay(1200);
                    const closeFinal = document.querySelector('.close-btn') || document.querySelector('button.close');
                    if (closeFinal) closeFinal.click();
                }
            } catch (e) {
                stats.fail++;
            }
            stats.total++;
            await delay(500);
        }

        // Chuyển trang nếu chưa đủ số lượng
        if (stats.total < totalToProcess) {
            const nextBtn = document.querySelector('.mat-paginator-navigation-next');
            if (nextBtn && !nextBtn.disabled) {
                console.log(`➡️ Đã xong trang, đang sang trang tiếp theo (Tiến độ: ${stats.total}/${totalToProcess})`);
                nextBtn.click();
                await delay(4000); // Chờ trang mới tải lâu hơn một chút để tránh lỗi
                await processPage();
            } else {
                finalize();
            }
        } else {
            finalize();
        }
    }

    function finalize() {
        const result = `📊 KẾT QUẢ ĐÃ CHẠY:\n- Đã xử lý: ${stats.total}/${totalToProcess}\n- Thành công: ${stats.success}\n- Đã đánh giá rồi: ${stats.skipped}\n- Lỗi: ${stats.fail}`;
        console.log(result);
        alert(result);
    }

    await processPage();
})();
