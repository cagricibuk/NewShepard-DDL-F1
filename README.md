# 🚀 Blue Origin BODDL-TP Flight 1 Visualization

Bu proje, **Blue Origin Deorbit, Descent, and Landing Tipping Point (BODDL-TP) Game Changing Development (GCD) Programı** kapsamında elde edilen uçuş verilerini kullanarak geliştirilmiş, uçuşu görsel olarak izlemeye ve analiz etmeye olanak sağlayan interaktif bir simülasyon arayüzüdür.

## ✨ Proje Özellikleri
- **React** ile geliştirilmiş modern ve responsive frontend
- **Material UI** kütüphanesi desteğiyle şık ve kullanışlı kullanıcı arayüzü
- **p5.js** kullanılarak oluşturulmuş 3D uçuş simülasyonu
- Hız–Zaman ve İrtifa–Zaman grafik gösterimleri
- Dikey **Flight Events Bar** ile uçuş boyunca kritik olayların görsel takibi
- Python scriptleri ile veri ön işleme ve uçuş zamanı senkronizasyonu

## 📁 Kullanılan Veriler
Veriler, NASA ve Blue Origin tarafından sağlanan, Flight 1 sırasında kaydedilmiş:
- IMU verileri (delta velocity, delta angle)
- Truth verileri (pozisyon, hız ve yönelim)
- Commercial LiDAR verileri (beam hatları boyunca hız ve mesafe ölçümleri)
- Önemli uçuş olaylarının zaman damgaları (liftoff, MECO, apogee, vb.)

## 🛠️ Kullanılan Teknolojiler
| Teknoloji            | Kullanım Amacı                         |
|----------------------|-----------------------------------------|
| **React**            | Front-end geliştirme                   |
| **Material UI**      | UI komponentleri ve tasarım desteği    |
| **p5.js**            | 3D simülasyon ve animasyon             |
| **Python**           | Veri düzenleme ve ön işleme            |
| **Chart.js**         | Zaman serisi grafikler için     |

## 📌 Geliştirme Planları

Bu proje üzerinde yapılacak geliştirmeler ve iyileştirmeler aşağıda sıralanmıştır:

- **Commercial LiDAR ve Yönelim Verileri**: Bu veriler kullanılarak daha detaylı uçuş ortamları oluşturulabilir. LiDAR verileri ile gerçek zamanlı zemin analizleri ve yönelim verileriyle uçuşun doğruluğu artırılabilir.
  
- **Manuel Olay Ekleme ve Oynatma Kontrol Seçenekleri**: Kullanıcıların uçuş sırasında manuel olarak olayları ekleyebilmesi veya belirli bir zaman dilimini oynatabilmesi sağlanabilir. Bu, uçuş simülasyonlarının daha etkileşimli ve eğitici olmasına yardımcı olabilir.

- **İniş Bölgesi Harita Gösterimi**: İniş bölgesi ve diğer önemli noktalar harita üzerinde görselleştirilebilir. Bu sayede uçuş rotası ve iniş bölgesi arasındaki ilişki daha net anlaşılabilir.

- **Gerçek Zamanlı Uçuş Takibi**: Verilerin gerçek zamanlı olarak senkronize edilmesi ve anlık uçuş parametrelerinin görüntülenmesi sağlanabilir. Bu, özellikle eğitim ve simülasyon amaçlı uçuşlarda oldukça faydalı olacaktır.

- **Kullanıcı Etkileşimli 3D Harita ve Görselleştirmeler**: 3D haritalar ve uçuş sırasında çeşitli dinamikler (hız, irtifa, yönelim vb.) ile etkileşimli görselleştirmeler oluşturulabilir.

---





