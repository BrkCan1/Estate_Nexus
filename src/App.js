import React, { useState, useEffect } from "react";
import "./App.css";
import { supabase } from "./supabase";
import {
  Trash2,
  Bell,
  TrendingUp,
  Home,
  FileText,
  Plus,
  LogOut,
  Wallet,
  X,
  Check,
  ArrowLeft,
  Copy,
  User,
  Settings,
  Shield,
  LayoutDashboard,
  Camera,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  Layers,
  CheckCircle,
  Users,
  Briefcase,
  Phone,
  Mail,
  Upload,
  Calculator,
  Eye,
  EyeOff,
  Lock,
  Save,
  Download,
  Clock,
} from "lucide-react";

// --- YARDIMCI FONKSİYONLAR ---
const numberToTurkishWords = (num) => {
  if (isNaN(num) || num === 0) return "SIFIR";
  const birler = [
    "",
    "BİR",
    "İKİ",
    "ÜÇ",
    "DÖRT",
    "BEŞ",
    "ALTI",
    "YEDİ",
    "SEKİZ",
    "DOKUZ",
  ];
  const onlar = [
    "",
    "ON",
    "YİRMİ",
    "OTUZ",
    "KIRK",
    "ELLİ",
    "ALTMIŞ",
    "YETMİŞ",
    "SEKSEN",
    "DOKSAN",
  ];
  const groups = ["", "BİN", "MİLYON", "MİLYAR"];

  const splitToGroups = (n) => {
    let str = n.toString();
    let groupsArr = [];
    while (str.length > 0) {
      groupsArr.push(str.slice(-3));
      str = str.slice(0, -3);
    }
    return groupsArr;
  };
  const convertGroup = (n) => {
    let str = n.toString().padStart(3, "0");
    let yuzler = parseInt(str[0]);
    let on = parseInt(str[1]);
    let bir = parseInt(str[2]);
    let res = "";
    if (yuzler !== 0) {
      if (yuzler === 1) res += "YÜZ";
      else res += birler[yuzler] + "YÜZ";
    }
    if (on !== 0) res += onlar[on];
    if (bir !== 0) res += birler[bir];
    return res;
  };
  let result = "";
  let numGroups = splitToGroups(num);
  for (let i = 0; i < numGroups.length; i++) {
    let groupVal = parseInt(numGroups[i]);
    if (groupVal !== 0) {
      let groupText = convertGroup(groupVal);
      if (i === 1 && groupVal === 1) groupText = "";
      result = groupText + groups[i] + result;
    }
  }
  return result + " TÜRK LİRASI";
};

// Yerel Depolama
const saveToLocal = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};
const getFromLocal = (key) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

// YENİ: SUPABASE AVATAR UPLOAD FONKSİYONU
const uploadAvatarToSupabase = async (file, userId) => {
  if (!file) return null;

  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    console.log("=== UPLOAD DEBUG START ===");
    console.log("1. File details:", {
      name: file.name,
      size: file.size,
      type: file.type,
      userId: userId,
      generatedFileName: fileName,
    });

    // Test if supabase is configured
    if (!supabase) {
      console.error("2. ERROR: Supabase object is undefined!");
      throw new Error("Supabase not configured");
    }

    console.log("2. Supabase object exists:", !!supabase);

    if (!supabase.storage) {
      console.error("3. ERROR: Supabase.storage is undefined!");
      throw new Error("Supabase storage not configured");
    }

    console.log("3. Supabase.storage exists:", !!supabase.storage);

    // Try to upload
    console.log("4. Attempting upload to avatars bucket...");
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("5. UPLOAD ERROR:", uploadError);
      console.error("   Error details:", {
        message: uploadError.message,
        statusCode: uploadError.statusCode,
        error: uploadError.error,
      });
      throw uploadError;
    }

    console.log("5. Upload successful!", uploadData);

    // Get public URL
    console.log("6. Getting public URL...");
    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    console.log("7. Public URL generated:", urlData.publicUrl);
    console.log("=== UPLOAD DEBUG END ===");

    return urlData.publicUrl;
  } catch (error) {
    console.error("=== UPLOAD FAILED ===");
    console.error("Error type:", error.constructor.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    console.error("===================");

    // Return null to indicate failure, don't use fallback here
    return null;
  }
};

const uploadFile = async (file, bucketName) => {
  if (!file) return null;
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    return data.publicUrl;
  } catch (e) {
    return URL.createObjectURL(file);
  }
};

// --- YENİ: DETAYLI KİŞİ KARTI (AGENT İÇİN) ---
const DetailedPersonCard = ({
  userId,
  roleTitle,
  color,
  users,
  allProperties,
  allContracts,
}) => {
  const person = users.find((u) => u.id === userId);
  if (!person) return null;

  const borderCol =
    color === "blue" ? "#3b82f6" : color === "green" ? "#06b6d4" : "#f59e0b";

  const userProperties = allProperties.filter((p) => p.owner_id === userId);
  const userContracts = allContracts.filter((c) => c.tenant_id === userId);

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "16px",
        border: `2px solid ${borderCol}`,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        transition: "all 0.3s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "start",
          gap: "16px",
          marginBottom: "16px",
        }}
      >
        <img
          src={person.avatar}
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "16px",
            objectFit: "cover",
            border: `3px solid ${borderCol}`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
          alt="avatar"
        />
        <div style={{ flex: 1 }}>
          <span
            className="badge badge-warning"
            style={{ fontSize: "10px", marginBottom: "6px" }}
          >
            {roleTitle}
          </span>
          <div
            style={{
              fontWeight: "800",
              fontSize: "18px",
              color: "var(--text-primary)",
              marginBottom: "4px",
            }}
          >
            {person.name}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginBottom: "4px",
            }}
          >
            <Phone size={14} /> {person.phone}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Mail size={14} /> {person.email}
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#f8fafc",
          padding: "14px",
          borderRadius: "12px",
          marginBottom: "12px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: "700",
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Home size={14} /> Mülkleri ({userProperties.length})
        </div>
        {userProperties.length > 0 ? (
          userProperties.map((prop) => (
            <div
              key={prop.id}
              style={{
                background: "var(--bg-secondary)",
                padding: "10px 12px",
                borderRadius: "8px",
                marginBottom: "8px",
                fontSize: "13px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  marginBottom: "4px",
                }}
              >
                {prop.street}
              </div>
              <div
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "12px",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>{prop.city_info}</span>
                <span style={{ fontWeight: "700", color: "#f97316" }}>
                  {prop.rent_amount.toLocaleString()} ₺
                </span>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-tertiary)",
              textAlign: "center",
              padding: "8px",
            }}
          >
            Mülk yok
          </div>
        )}
      </div>

      <div
        style={{
          background: "#f8fafc",
          padding: "14px",
          borderRadius: "12px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            fontWeight: "700",
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            marginBottom: "10px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <FileText size={14} /> Sözleşmeleri ({userContracts.length})
        </div>
        {userContracts.length > 0 ? (
          userContracts.map((contract) => {
            const property = allProperties.find(
              (p) => p.id === contract.property_id
            );
            return (
              <div
                key={contract.id}
                style={{
                  background: "var(--bg-secondary)",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  fontSize: "13px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div
                  style={{
                    fontWeight: "600",
                    color: "var(--text-primary)",
                    marginBottom: "4px",
                  }}
                >
                  {property?.title || property?.street || "Bilinmeyen Mülk"}
                </div>
                <div
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    className="badge badge-success"
                    style={{ fontSize: "10px" }}
                  >
                    {contract.status}
                  </span>
                  <span style={{ fontWeight: "700", color: "#06b6d4" }}>
                    {contract.rent_amount.toLocaleString()} ₺/ay
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-tertiary)",
              textAlign: "center",
              padding: "8px",
            }}
          >
            Sözleşme yok
          </div>
        )}
      </div>
    </div>
  );
};

// --- BASIT KİŞİ KARTI (DETAY SAYFALARI İÇİN) ---
const SimplePersonCard = ({ userId, roleTitle, color, users }) => {
  const person = users.find((u) => u.id === userId);
  if (!person) return null;
  const borderCol =
    color === "blue" ? "#3b82f6" : color === "green" ? "#06b6d4" : "#f59e0b";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "14px",
        background: "var(--bg-tertiary)",
        borderRadius: "14px",
        marginBottom: "12px",
        borderLeft: `4px solid ${borderCol}`,
        border: "1px solid #e2e8f0",
        transition: "all 0.3s",
      }}
    >
      <img
        src={person.avatar}
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "12px",
          marginRight: "14px",
          backgroundColor: "#ddd",
          objectFit: "cover",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
        alt="avatar"
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: "11px",
            fontWeight: "700",
            color: "var(--text-secondary)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {roleTitle}
        </div>
        <div
          style={{
            fontWeight: "700",
            fontSize: "15px",
            color: "var(--text-primary)",
            marginTop: "2px",
          }}
        >
          {person.name}
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            marginTop: "4px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Phone size={12} /> {person.phone}
        </div>
        <div
          style={{
            fontSize: "13px",
            color: "var(--text-secondary)",
            marginTop: "4px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Mail size={12} /> {person.email}
        </div>
      </div>
    </div>
  );
};

const ImageGallery = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const displayImages =
    images && images.length > 0 ? images : ["https://picsum.photos/400/300"];
  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };
  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentIndex(
      (prev) => (prev - 1 + displayImages.length) % displayImages.length
    );
  };

  return (
    <div>
      <div className="gallery-container">
        <button className="gallery-btn prev-btn" onClick={prevImage}>
          ❮
        </button>
        <button className="gallery-btn next-btn" onClick={nextImage}>
          ❯
        </button>
        <img
          src={displayImages[currentIndex]}
          className="gallery-main-img"
          alt="Property"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "center",
            background: "#1e293b",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            right: "16px",
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            color: "white",
            padding: "6px 14px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: "700",
          }}
        >
          {currentIndex + 1} / {displayImages.length}
        </div>
      </div>
      <div className="thumbnails">
        {displayImages.map((img, idx) => (
          <img
            key={idx}
            src={img}
            className={`thumb ${idx === currentIndex ? "active" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
            }}
            alt="thumb"
            style={{
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        ))}
        ))}
      </div>
    </div>
  );
};

// --- ANA UYGULAMA ---
export default function App() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);

  // Next Level UI/UX States
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  // Yeni özellikler için state'ler
  const [showProfileEditModal, setShowProfileEditModal] = useState(false);
  const [profileEditForm, setProfileEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [email, setEmail] = useState("ahmet@test.com");
  const [password, setPassword] = useState("123");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedRole, setSelectedRole] = useState("CLIENT");

  const [users, setUsers] = useState([]);
  const [allProperties, setAllProperties] = useState([]);
  const [allContracts, setAllContracts] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [siteExpenses, setSiteExpenses] = useState([]);
  const [myNotifications, setMyNotifications] = useState([]);
  const [tuikRates, setTuikRates] = useState([]);
  const [tuikLoading, setTuikLoading] = useState(false);

  const [toast, setToast] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("mülklerim");
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const [selectedProperty, setSelectedProperty] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);

  // YENİ: Avatar yükleme durumu
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [hasNewNotifications, setHasNewNotifications] = useState(false);

  const [propForm, setPropForm] = useState({
    title: "", // YENİ: Mülk başlığı
    street: "",
    building: "",
    doorNo: "",
    cityInfo: "",
    rentAmount: "",
    size: "",
    type: "",
    roomCount: "",
    floor: "",
    totalFloors: "",
    buildingAge: "",
    heating: "",
    furnished: "Boş",
    balcony: false,
    elevator: false,
    parking: false,
    description: "",
  });
  const [propImageFiles, setPropImageFiles] = useState([]);
  const [contractForm, setContractForm] = useState({
    propertyId: "",
    tenantId: "",
    propertyTitle: "",
    street: "",
    building: "",
    cityInfo: "",
    type: "",
    landlordName: "",
    rentAmount: "",
    rentAmountText: "",
    depositAmount: "",
    paymentMethod: "Banka Hesabına Havale/EFT",
    landlordIBAN: "TR",
    duration: "1 (BİR) YIL",
    startDate: "01.07.2025",
    fixtures: "Daire boyalı ve temiz teslim edilmiştir.",
    foundProperty: null,
  });
  const [requestMessage, setRequestMessage] = useState("");
  const [requestFiles, setRequestFiles] = useState([]);

  const [expenseForm, setExpenseForm] = useState({ name: "", amount: "" });
  const [calcForm, setCalcForm] = useState({ currentRent: "", rate: "" });
  const [calcResult, setCalcResult] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchNotifications();
      fetchInflationRates();
      fetchAllData();

      // Poll for new notifications every 10 seconds
      const notificationInterval = setInterval(() => {
        fetchNotificationsWithAnimation();
      }, 10000);

      return () => clearInterval(notificationInterval);
    }
  }, [currentUser]);

  const fetchNotificationsWithAnimation = async () => {
    if (!currentUser) return;

    const oldUnreadCount = myNotifications.filter((n) => !n.read).length;

    try {
      const { data: notifsData, error: notifsError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (notifsError) throw notifsError;

      if (notifsData) {
        const newUnreadCount = notifsData.filter((n) => !n.read).length;

        // Yeni bildirim geldi mi?
        if (newUnreadCount > oldUnreadCount) {
          setHasNewNotifications(true);
          setTimeout(() => setHasNewNotifications(false), 3000);
        }

        setMyNotifications(notifsData);
      }
    } catch (e) {
      console.error("Notification refresh failed:", e);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const [uRes, pRes, cRes, rRes] = await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("properties").select("*"),
        supabase.from("contracts").select("*"),
        supabase
          .from("requests")
          .select("*")
          .order("date", { ascending: false }),
      ]);

      if (uRes.error) throw new Error("Err");

      setUsers(uRes.data || []);
      setAllProperties(pRes.data || []);
      setAllContracts(cRes.data || []);
      setAllRequests(rRes.data || []);

      if (currentUser) {
        const { data: expensesData } = await supabase
          .from("expenses")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("id", { ascending: false });
        setSiteExpenses(expensesData || []);
      }
    } catch (error) {
      const localUsers = getFromLocal("profiles");
      if (localUsers) setUsers(localUsers);
      else {
        const demoUsers = [
          {
            id: "U" + Math.floor(Math.random() * 9000 + 1000),
            name: "Ahmet Yılmaz",
            email: "ahmet@test.com",
            password: "123",
            role: "CLIENT",
            avatar:
              "https://ui-avatars.com/api/?name=Ahmet+Yilmaz&background=4F46E5&color=fff",
            phone: "555-0000",
          },
          {
            id: "U" + Math.floor(Math.random() * 9000 + 1000),
            name: "Mehmet Emlak",
            email: "mehmet@test.com",
            password: "123",
            role: "AGENT",
            avatar:
              "https://ui-avatars.com/api/?name=Mehmet+Emlak&background=10B981&color=fff",
            phone: "555-1111",
          },
        ];
        setUsers(demoUsers);
        saveToLocal("profiles", demoUsers);
      }

      const localProps = getFromLocal("properties");
      if (localProps) setAllProperties(localProps);
      else {
        const demoProps = [
          {
            id: "P101",
            owner_id: "U" + Math.floor(Math.random() * 9000 + 1000),
            street: "Bağdat Caddesi",
            building: "Palmiye Apt",
            door_no: "12",
            city_info: "İstanbul/Kadıköy",
            rent_amount: 45000,
            status: "Occupied",
            type: "3+1 Daire",
            room_count: "3+1",
            size: 120,
            image_urls: ["https://picsum.photos/id/10/400/300"],
          },
          {
            id: "P102",
            owner_id: "U" + Math.floor(Math.random() * 9000 + 1000),
            street: "Atatürk Bulvarı",
            building: "Güneş Sitesi",
            door_no: "5",
            city_info: "Ankara/Çankaya",
            rent_amount: 25000,
            status: "Vacant",
            type: "2+1 Daire",
            room_count: "2+1",
            size: 90,
            image_urls: ["https://picsum.photos/id/11/400/300"],
          },
        ];
        setAllProperties(demoProps);
        saveToLocal("properties", demoProps);
      }

      const localContracts = getFromLocal("contracts");
      if (localContracts) setAllContracts(localContracts);
      else {
        const demoContracts = [
          {
            id: "C1",
            property_id: "P101",
            owner_id: "U" + Math.floor(Math.random() * 9000 + 1000),
            tenant_id: "U" + Math.floor(Math.random() * 9000 + 1000),
            agent_id: "U" + Math.floor(Math.random() * 9000 + 1000),
            rent_amount: 45000,
            deposit_amount: 45000,
            status: "Active",
            start_date: "01.01.2025",
            iban: "TR12 3456 7890",
            terms: "Demo Sözleşme",
          },
        ];
        setAllContracts(demoContracts);
        saveToLocal("contracts", demoContracts);
      }

      const localExp = getFromLocal("expenses");
      if (currentUser) {
        let allExps = localExp || [
          {
            id: 1,
            user_id: "U" + Math.floor(Math.random() * 9000 + 1000),
            name: "Apartman Aidatı (Ocak)",
            amount: 1500,
            date: "01.01.2025",
          },
        ];
        if (!localExp) saveToLocal("expenses", allExps);
        setSiteExpenses(allExps.filter((e) => e.user_id === currentUser.id));
      }

      const localReqs = getFromLocal("requests");
      if (localReqs) setAllRequests(localReqs);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!currentUser) return;

    console.log("Fetching notifications for user:", currentUser.id);

    try {
      const { data: notifsData, error: notifsError } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (notifsError) {
        console.error("Supabase notification fetch error:", notifsError);
        throw notifsError;
      }

      console.log(
        "Notifications fetched from database:",
        notifsData?.length || 0
      );

      if (notifsData && notifsData.length > 0) {
        setMyNotifications(notifsData);
      } else {
        console.log("No notifications found in database");
        setMyNotifications([]);
      }
    } catch (e) {
      console.error("Notification fetch failed:", e);
      setMyNotifications([]);
    }
  };

  const fetchInflationRates = async () => {
    setTuikLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const liveData = [
        { month: "Aralık 2025", rate: 45.5 },
        { month: "Kasım 2025", rate: 47.1 },
        { month: "Ekim 2025", rate: 48.8 },
        { month: "Eylül 2025", rate: 50.25 },
        { month: "Ağustos 2025", rate: 52.1 },
        { month: "Temmuz 2025", rate: 54.3 },
        { month: "Haziran 2025", rate: 56.2 },
        { month: "Mayıs 2025", rate: 58.1 },
        { month: "Nisan 2025", rate: 59.9 },
        { month: "Mart 2025", rate: 61.5 },
        { month: "Şubat 2025", rate: 63.1 },
        { month: "Ocak 2025", rate: 64.86 },
      ];
      setTuikRates(liveData);
    } catch (err) {
    } finally {
      setTuikLoading(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    showToast(`Kopyalandı: ${text}`);
  };

  // ==========================================
  // NEXT LEVEL UI/UX FUNCTIONS
  // ==========================================

  // Dark Mode Toggle
  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("darkMode", JSON.stringify(newMode));

    // Apply theme to document
    if (newMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    showToast(newMode ? "Karanlik mod aktif" : "Aydinlik mod aktif", "info");
  };

  // Apply dark mode on mount
  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }, [darkMode]);

  // Initialize Chart.js and Calendar when dashboard loads
  React.useEffect(() => {
    if (currentView === "dashboard") {
      // Load Chart.js if not already loaded
      if (!window.Chart) {
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js";
        script.onload = () => {
          initFinancialChart();
        };
        document.body.appendChild(script);
      } else {
        initFinancialChart();
      }

      // Render mini calendar
      renderMiniCalendar();
    }
  }, [currentView, allContracts, siteExpenses]);

  // Initialize Financial Chart
  const initFinancialChart = () => {
    const canvas = document.getElementById("financialChart");
    if (!canvas || !window.Chart) return;

    // Destroy existing chart
    if (window.financialChartInstance) {
      window.financialChartInstance.destroy();
    }

    // GERÇEK GELİR HESAPLAMA
    console.log("=== GELIR HESAPLAMA BAŞLADI ===");
    console.log("CurrentUser:", currentUser.id, currentUser.name);
    console.log("Tüm properties:", allProperties.length);
    console.log("Tüm contracts:", allContracts.length);

    // Yaklaşım 1: Mülk statusüne göre
    const myRentedOutProperties = allProperties.filter(
      (p) => p.owner_id === currentUser.id && p.status === "Dolu"
    );

    console.log(
      "Benim toplam mülklerim:",
      allProperties.filter((p) => p.owner_id === currentUser.id).length
    );
    console.log("Dolu statusundeki mülklerim:", myRentedOutProperties.length);
    console.log(
      "Dolu mülkler detay:",
      myRentedOutProperties.map((p) => ({
        id: p.id,
        street: p.street,
        status: p.status,
        owner_id: p.owner_id,
      }))
    );

    let totalMonthlyIncome = 0;
    myRentedOutProperties.forEach((property) => {
      const activeContract = allContracts.find(
        (c) => c.property_id === property.id && c.status === "Active"
      );
      if (activeContract) {
        console.log(
          `✅ Mülk ${property.id} (${property.street}) → Kira: ${activeContract.rent_amount} TL`
        );
        totalMonthlyIncome += activeContract.rent_amount || 0;
      } else {
        console.log(
          `❌ Mülk ${property.id} (${property.street}) → Sözleşme yok!`
        );
      }
    });

    // Yaklaşım 2: Doğrudan sözleşmelerden (yedek)
    const myActiveContracts = allContracts.filter(
      (c) => c.owner_id === currentUser.id && c.status === "Active"
    );
    const totalFromContracts = myActiveContracts.reduce(
      (sum, c) => sum + (c.rent_amount || 0),
      0
    );

    console.log("--- ALTERNATIF HESAPLAMA ---");
    console.log("Benim aktif sözleşmelerim:", myActiveContracts.length);
    console.log(
      "Aktif sözleşmeler detay:",
      myActiveContracts.map((c) => ({
        id: c.id,
        property_id: c.property_id,
        rent: c.rent_amount,
        status: c.status,
      }))
    );
    console.log("Sözleşmelerden toplam gelir:", totalFromContracts);

    // En yüksek olanı kullan
    if (totalFromContracts > totalMonthlyIncome) {
      console.log("⚠️ DİKKAT: Mülk statusleri yanlış olabilir!");
      console.log(
        "⚠️ Sözleşmelerden gelen gelir daha yüksek, onu kullanıyorum"
      );
      totalMonthlyIncome = totalFromContracts;
    }

    console.log("📊 SONUÇ: Toplam aylık gelir:", totalMonthlyIncome, "TL");
    console.log("=============================");

    // GERÇEK GİDER HESAPLAMA
    // Kullanıcının kiracı olduğu mülklerin kira gideri
    const myTenantContracts = allContracts.filter(
      (c) => c.tenant_id === currentUser.id && c.status === "Active"
    );

    let totalRentExpense = 0;
    myTenantContracts.forEach((contract) => {
      totalRentExpense += contract.rent_amount || 0;
    });

    // Site giderleri
    const totalSiteExpenses = siteExpenses.reduce((a, b) => a + b.amount, 0);
    const totalMonthlyExpense = totalRentExpense + totalSiteExpenses;

    // 6 aylık veri (son 6 ay için aynı gelir/gider - ilerleyen günlerde geçmiş data eklenebilir)
    const monthlyIncome = [
      totalMonthlyIncome * 0.95,
      totalMonthlyIncome * 0.98,
      totalMonthlyIncome,
      totalMonthlyIncome,
      totalMonthlyIncome,
      totalMonthlyIncome,
    ];

    const monthlyExpenses = [
      totalMonthlyExpense * 0.9,
      totalMonthlyExpense * 0.95,
      totalMonthlyExpense * 1.02,
      totalMonthlyExpense * 0.98,
      totalMonthlyExpense,
      totalMonthlyExpense,
    ];

    const ctx = canvas.getContext("2d");
    window.financialChartInstance = new window.Chart(ctx, {
      type: "bar",
      data: {
        labels: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran"],
        datasets: [
          {
            label: "Gelir",
            data: monthlyIncome,
            backgroundColor: "rgba(6, 182, 212, 0.8)",
            borderColor: "#06b6d4",
            borderWidth: 2,
            borderRadius: 8,
            barThickness: 24,
          },
          {
            label: "Gider",
            data: monthlyExpenses,
            backgroundColor: "rgba(249, 115, 22, 0.8)",
            borderColor: "#f97316",
            borderWidth: 2,
            borderRadius: 8,
            barThickness: 24,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            padding: 12,
            titleFont: {
              size: 14,
              weight: "bold",
            },
            bodyFont: {
              size: 13,
            },
            callbacks: {
              label: function (context) {
                return (
                  context.dataset.label +
                  ": " +
                  context.parsed.y.toLocaleString("tr-TR") +
                  " ₺"
                );
              },
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                size: 12,
                weight: "600",
              },
              color: darkMode ? "#94a3b8" : "#64748b",
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: darkMode
                ? "rgba(148, 163, 184, 0.1)"
                : "rgba(226, 232, 240, 0.8)",
              drawBorder: false,
            },
            ticks: {
              font: {
                size: 11,
              },
              color: darkMode ? "#94a3b8" : "#64748b",
              callback: function (value) {
                return value.toLocaleString("tr-TR") + " ₺";
              },
            },
          },
        },
      },
    });
  };

  // Render Mini Calendar
  const renderMiniCalendar = () => {
    const container = document.getElementById("miniCalendar");
    if (!container) return;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const currentDay = today.getDate();

    // Get first day of month and number of days
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Month names
    const monthNames = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ];

    let calendarHTML = `
      <div style="margin-bottom: 12px; text-align: center;">
        <div style="font-size: 14px; font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">
          ${monthNames[currentMonth]} ${currentYear}
        </div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-bottom: 8px;">
        ${["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]
          .map(
            (day) =>
              `<div style="text-align: center; font-size: 10px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; padding: 4px 0;">
            ${day}
          </div>`
          )
          .join("")}
      </div>
      <div class="calendar-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px;">
    `;

    // Add empty cells for days before month starts
    const startDay = firstDay === 0 ? 6 : firstDay - 1; // Convert Sunday=0 to Monday=0
    for (let i = 0; i < startDay; i++) {
      calendarHTML += "<div></div>";
    }

    // Add days
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === currentDay;
      calendarHTML += `
        <div class="calendar-day${isToday ? " calendar-day-today" : ""}" style="
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: ${isToday ? "700" : "600"};
          color: ${isToday ? "#ffffff" : "var(--text-primary)"};
          background: ${
            isToday
              ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
              : "transparent"
          };
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        ">
          ${day}
        </div>
      `;
    }

    calendarHTML += "</div>";
    container.innerHTML = calendarHTML;
  };

  // Skeleton Loading Helper
  const showSkeletonLoading = (duration = 1000) => {
    setShowSkeleton(true);
    setTimeout(() => setShowSkeleton(false), duration);
  };

  // File Upload Handlers
  const handleFileUpload = (files) => {
    const fileArray = Array.from(files);
    const newFiles = fileArray.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    setUploadedFiles([...uploadedFiles, ...newFiles]);
    showToast(`${newFiles.length} dosya yuklendi`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const removeUploadedFile = (id) => {
    setUploadedFiles(uploadedFiles.filter((f) => f.id !== id));
    showToast("Dosya kaldırıldı");
  };

  // ==========================================
  // YENİ ÖZELLİKLER FONKSİYONLARI
  // ==========================================

  // Profil düzenleme modalını aç
  const openProfileEdit = () => {
    setProfileEditForm({
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setShowProfileEditModal(true);
  };

  // Profil güncelleme
  const handleProfileUpdate = async () => {
    // Validasyon
    if (!profileEditForm.name.trim()) {
      return showToast("Ad Soyad boş olamaz", "error");
    }
    if (!profileEditForm.email.trim()) {
      return showToast("E-posta boş olamaz", "error");
    }

    // Şifre değiştirme kontrolü
    if (profileEditForm.newPassword) {
      if (!profileEditForm.currentPassword) {
        return showToast("Mevcut şifrenizi girin", "error");
      }
      if (profileEditForm.newPassword !== profileEditForm.confirmPassword) {
        return showToast("Yeni şifreler eşleşmiyor", "error");
      }
      if (profileEditForm.newPassword.length < 3) {
        return showToast("Şifre en az 3 karakter olmalı", "error");
      }
    }

    setLoading(true);

    try {
      // Kullanıcı bilgilerini güncelle
      const updatedUser = {
        ...currentUser,
        name: profileEditForm.name,
        email: profileEditForm.email,
        phone: profileEditForm.phone,
      };

      // Supabase'e kaydet
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          name: profileEditForm.name,
          email: profileEditForm.email,
          phone: profileEditForm.phone,
          ...(profileEditForm.newPassword && {
            password: profileEditForm.newPassword,
          }),
        })
        .eq("id", currentUser.id);

      if (updateError) {
        console.error("Profile update error:", updateError);
        // Fallback: Local storage'a kaydet
        const allUsers = JSON.parse(localStorage.getItem("profiles") || "[]");
        const userIndex = allUsers.findIndex((u) => u.id === currentUser.id);
        if (userIndex !== -1) {
          allUsers[userIndex] = {
            ...allUsers[userIndex],
            ...updatedUser,
            ...(profileEditForm.newPassword && {
              password: profileEditForm.newPassword,
            }),
          };
          localStorage.setItem("profiles", JSON.stringify(allUsers));
        }
      }

      // State'i güncelle
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      showToast("Profil basariyla guncellendi!");
      setShowProfileEditModal(false);
    } catch (error) {
      console.error("Profile update error:", error);
      showToast("Profil güncellenirken hata oluştu", "error");
    } finally {
      setLoading(false);
    }
  };

  // Logo tıklama - Ana sayfaya dön
  const handleLogoClick = () => {
    setCurrentView("dashboard");
    showToast("Ana sayfaya yonlendirildiniz", "info");
  };

  // Talep formuna fotoğraf ekleme
  const handleRequestFileUpload = (files) => {
    const fileArray = Array.from(files);
    const newFiles = fileArray.map((file) => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));
    setRequestFiles([...requestFiles, ...newFiles.map((f) => f.file)]);
    showToast(`${newFiles.length} dosya eklendi`);
  };

  // ==========================================
  // ORIGINAL FUNCTIONS
  // ==========================================

  const handleLogin = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email.toLowerCase())
        .eq("password", password)
        .single();
      if (data && !error) {
        loginUser(data);
        return;
      }
    } catch (e) {}

    const allUsers = getFromLocal("profiles") || users;
    const demoUser = allUsers.find(
      (u) => u.email === email.toLowerCase() && u.password === password
    );

    if (demoUser) {
      loginUser(demoUser);
    } else {
      showToast(
        "Hatalı e-posta veya şifre (Demo: ahmet@test.com / 123)",
        "error"
      );
    }
  };

  const loginUser = (user) => {
    setCurrentUser(user);
    setActiveTab(user.role === "AGENT" ? "portfoy" : "mülklerim");
    showToast(`Hoş geldin, ${user.name}`);
  };

  const handleRegister = async () => {
    showToast("Demo modunda kayıt kapalıdır.");
    setIsLogin(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setShowProfileModal(false);
    setCurrentView("dashboard");
    setMyNotifications([]);
    setSiteExpenses([]);
  };

  // YENİ: GELIŞMIŞ AVATAR YÜKLEME FONKSİYONU
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Dosya boyutu kontrolü (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("Dosya boyutu 5MB'dan küçük olmalı", "error");
      return;
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith("image/")) {
      showToast("Lütfen bir resim dosyası seçin", "error");
      return;
    }

    setUploadingAvatar(true);
    showToast("Profil fotoğrafı yükleniyor...", "info");

    // HEMEN YEREL ÖNİZLEME GÖSTER
    const localPreviewUrl = URL.createObjectURL(file);
    const tempUpdatedUser = { ...currentUser, avatar: localPreviewUrl };
    setCurrentUser(tempUpdatedUser);

    try {
      console.log("Starting avatar upload for user:", currentUser.id);

      // 1. Supabase'e yükle
      let avatarUrl = await uploadAvatarToSupabase(file, currentUser.id);

      // Eğer Supabase başarısız olduysa, yerel URL'i kullan
      if (!avatarUrl) {
        console.warn("Supabase upload failed, keeping local preview URL");
        avatarUrl = localPreviewUrl;
        showToast(
          "Fotoğraf yerel olarak kaydedildi (Supabase bağlantısı yok)",
          "info"
        );
      } else {
        console.log("Supabase upload successful, cleaning up local preview");
        // Supabase başarılıysa local preview'ı temizle
        URL.revokeObjectURL(localPreviewUrl);
        showToast("Profil fotoğrafı başarıyla güncellendi! ");
      }

      console.log("Final avatar URL:", avatarUrl);

      // 2. Kullanıcı objesini kalıcı URL ile güncelle
      const updatedUser = { ...currentUser, avatar: avatarUrl };
      setCurrentUser(updatedUser);

      // 3. Veritabanını güncelle (sadece Supabase URL varsa)
      if (avatarUrl !== localPreviewUrl) {
        try {
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ avatar: avatarUrl })
            .eq("id", currentUser.id);

          if (updateError) {
            console.error("Database update error:", updateError);
          } else {
            console.log("Database updated successfully");
          }
        } catch (dbError) {
          console.error("Database update failed:", dbError);
        }
      }

      // 4. Local storage'ı güncelle
      const allUsers = getFromLocal("profiles") || users;
      const newUsers = allUsers.map((u) =>
        u.id === currentUser.id ? updatedUser : u
      );
      saveToLocal("profiles", newUsers);
      setUsers(newUsers);

      console.log("Avatar update completed");
    } catch (error) {
      console.error("Avatar change error:", error);
      showToast(
        "Profil fotoğrafı yüklenemedi. Lütfen tekrar deneyin.",
        "error"
      );

      // Hata durumunda orijinal avatarı geri yükle
      setCurrentUser(currentUser);
      URL.revokeObjectURL(localPreviewUrl);
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const handleAddProperty = async () => {
    // Zorunlu alanları kontrol et
    if (
      !propForm.title ||
      !propForm.street ||
      !propForm.rentAmount ||
      !propForm.cityInfo ||
      !propForm.type ||
      !propForm.roomCount ||
      !propForm.size
    ) {
      showToast("Zorunlu alanları (*) doldurun", "error");
      return;
    }

    setLoading(true);

    try {
      // Resimleri yükle
      const imageUrls = await Promise.all(
        propImageFiles.map((file) => uploadFile(file, "property-images"))
      );
      if (imageUrls.length === 0)
        imageUrls.push("https://picsum.photos/400/300");

      const newProp = {
        id: "P" + Math.floor(Math.random() * 9000 + 1000),
        owner_id: currentUser.id,
        status: "Vacant",
        image_urls: imageUrls,
        title: propForm.title || "Kiralık Daire",
        street: propForm.street,
        building: propForm.building || null,
        door_no: propForm.doorNo || null,
        city_info: propForm.cityInfo,
        district:
          propForm.cityInfo?.split("/")[1] || propForm.cityInfo || "Merkez",

        rent_amount: parseInt(propForm.rentAmount) || 0,
        size: parseInt(propForm.size) || 100,
        type: propForm.type,
        rooms: propForm.roomCount || "3+1",
        room_count: propForm.roomCount,
        floor: parseInt(propForm.floor) || null,
        total_floors: propForm.totalFloors || null,
        building_age: propForm.buildingAge || null,
        heating: propForm.heating || null,
        furnished: propForm.furnished || "Boş",
        has_balcony: propForm.balcony || false,
        has_elevator: propForm.elevator || false,
        has_parking: propForm.parking || false,
        description: propForm.description || null,
      };

      console.log("Mulk kaydediliyor:", newProp);

      // Supabase'e kaydet
      const { data, error } = await supabase
        .from("properties")
        .insert([newProp])
        .select();

      if (error) {
        console.error("ERROR: Supabase hatasi:", error);
        throw error;
      }

      console.log("SUCCESS: Supabase'e kaydedildi:", data);

      // Local state'i güncelle
      const updatedProps = [newProp, ...allProperties];
      setAllProperties(updatedProps);
      saveToLocal("properties", updatedProps);

      // Form'u sıfırla
      setPropForm({
        title: "", // YENİ: Başlığı da sıfırla
        street: "",
        building: "",
        doorNo: "",
        cityInfo: "",
        rentAmount: "",
        size: "",
        type: "",
        roomCount: "",
        floor: "",
        totalFloors: "",
        buildingAge: "",
        heating: "",
        furnished: "Boş",
        balcony: false,
        elevator: false,
        parking: false,
        description: "",
      });
      setPropImageFiles([]);

      showToast("Mülk başarıyla eklendi! ");
      setCurrentView("dashboard");
      setLoading(false);
    } catch (error) {
      console.error("ERROR: Mulk ekleme hatasi:", error);
      showToast(
        "Hata: " + (error.message || "Mülk eklenirken bir sorun oluştu"),
        "error"
      );
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (id) => {
    if (
      window.confirm(
        "Bu mulku silmek istediginize emin misiniz? Bu mulke ait sozlesmeler, talepler ve bildirimler de silinecek!"
      )
    ) {
      setLoading(true);

      try {
        console.log("Deleting property:", id);

        // 1. Bu mülke ait sözleşmeleri bul
        const propertyContracts = allContracts.filter(
          (c) => c.property_id === id
        );
        const contractIds = propertyContracts.map((c) => c.id);

        console.log("Found contracts to delete:", contractIds);

        // 2. Bu sözleşmelere ait talepleri sil
        if (contractIds.length > 0) {
          const { error: requestsError } = await supabase
            .from("requests")
            .delete()
            .in("contract_id", contractIds);

          if (requestsError) {
            console.error("Requests delete error:", requestsError);
          } else {
            console.log("Requests deleted for contracts:", contractIds);
          }
        }

        // 3. Bu sözleşmelere ve mülke ait bildirimleri sil
        if (contractIds.length > 0) {
          const { error: notificationsError } = await supabase
            .from("notifications")
            .delete()
            .in("related_id", contractIds);

          if (notificationsError) {
            console.error("Notifications delete error:", notificationsError);
          } else {
            console.log("Notifications deleted for contracts:", contractIds);
          }
        }

        // 4. Sözleşmeleri sil
        if (contractIds.length > 0) {
          const { error: contractsError } = await supabase
            .from("contracts")
            .delete()
            .eq("property_id", id);

          if (contractsError) {
            console.error("Contracts delete error:", contractsError);
          } else {
            console.log("Contracts deleted:", contractIds.length);
          }
        }

        // 5. Mülkü sil
        const { error: propertyError } = await supabase
          .from("properties")
          .delete()
          .eq("id", id);

        if (propertyError) {
          console.error("Property delete error:", propertyError);
          throw propertyError;
        }

        console.log("Property deleted successfully");

        // Local state'leri güncelle
        const updatedProps = allProperties.filter((p) => p.id !== id);
        setAllProperties(updatedProps);
        saveToLocal("properties", updatedProps);

        const updatedContracts = allContracts.filter(
          (c) => c.property_id !== id
        );
        setAllContracts(updatedContracts);
        saveToLocal("contracts", updatedContracts);

        const updatedRequests = allRequests.filter(
          (r) => !contractIds.includes(r.contract_id)
        );
        setAllRequests(updatedRequests);
        saveToLocal("requests", updatedRequests);

        const updatedNotifs = myNotifications.filter(
          (n) => !contractIds.includes(n.related_id)
        );
        setMyNotifications(updatedNotifs);

        setCurrentView("dashboard");
        showToast("Mulk ve bagli tum veriler silindi");
        setLoading(false);
      } catch (error) {
        console.error("Property deletion failed:", error);
        showToast("Hata: " + (error.message || "Mulk silinemedi"), "error");
        setLoading(false);
      }
    }
  };

  const checkPropertyId = () => {
    const prop = allProperties.find((p) => p.id === contractForm.propertyId);
    if (prop) {
      const owner = users.find((u) => u.id === prop.owner_id);
      setContractForm({
        ...contractForm,
        foundProperty: prop,
        landlordName: owner?.name || "Bilinmiyor",
        propertyTitle: prop.title || prop.street, // YENİ: Başlık kullan
        street: prop.street,
        building: prop.building + " " + prop.door_no,
        cityInfo: prop.city_info,
        type: prop.type,
        rentAmount: prop.rent_amount.toString(),
        rentAmountText: numberToTurkishWords(prop.rent_amount),
        depositAmount: prop.rent_amount.toString(),
      });
      showToast("Mülk bilgileri getirildi");
    } else {
      showToast("Mülk bulunamadı", "error");
    }
  };

  const handleCreateContract = async () => {
    if (!contractForm.foundProperty)
      return showToast("Once mulku dogrulayin", "error");
    if (!contractForm.tenantId) return showToast("Kiraci ID giriniz", "error");

    setLoading(true);

    try {
      const newC = {
        id: "C" + Math.floor(Math.random() * 9000 + 1000),
        property_id: contractForm.foundProperty.id,
        rent_amount: parseInt(contractForm.rentAmount),
        deposit_amount: parseInt(contractForm.depositAmount),
        status: "Pending", // Onay bekliyor
        owner_id: contractForm.foundProperty.owner_id,
        tenant_id: contractForm.tenantId,
        agent_id: currentUser.id,
        start_date: contractForm.startDate,
        end_date: null,
        iban: contractForm.landlordIBAN,
        terms: contractForm.fixtures,
      };

      console.log("Creating contract:", newC);

      // Supabase'e kaydet
      const { data: insertedContract, error: contractError } = await supabase
        .from("contracts")
        .insert([newC])
        .select();

      if (contractError) {
        console.error("Contract creation error:", contractError);
        throw contractError;
      }

      console.log("Contract created successfully:", insertedContract);

      // Local state'i guncelle
      const updatedContracts = [newC, ...allContracts];
      setAllContracts(updatedContracts);
      saveToLocal("contracts", updatedContracts);

      // BİLDİRİMLER OLUŞTUR
      const propertyName =
        contractForm.foundProperty.title || contractForm.foundProperty.street;
      const notifications = [];

      // 1. EV SAHİBİNE BİLDİRİM (eger emlakci degilse)
      if (contractForm.foundProperty.owner_id !== currentUser.id) {
        notifications.push({
          user_id: contractForm.foundProperty.owner_id,
          message: `[SOZLESME DAVETI] ${currentUser.name} "${propertyName}" mulku icin sozlesme olusturdu. Onayiniz bekleniyor.`,
          related_id: newC.id,
          type: "contract_invite",
          read: false,
          created_at: new Date().toISOString(),
        });
        console.log(
          "Owner notification added:",
          contractForm.foundProperty.owner_id
        );
      }

      // 2. KİRACIYA BİLDİRİM (eger emlakci degilse)
      if (contractForm.tenantId !== currentUser.id) {
        notifications.push({
          user_id: contractForm.tenantId,
          message: `[SOZLESME DAVETI] ${currentUser.name} sizi "${propertyName}" mulku icin sozlesmeye davet etti. Onayiniz bekleniyor.`,
          related_id: newC.id,
          type: "contract_invite",
          read: false,
          created_at: new Date().toISOString(),
        });
        console.log("Tenant notification added:", contractForm.tenantId);
      }

      // Bildirimleri kaydet
      if (notifications.length > 0) {
        console.log("Saving notifications:", notifications);
        console.log("Notification count:", notifications.length);

        const { data: insertedNotifs, error: notifError } = await supabase
          .from("notifications")
          .insert(notifications)
          .select();

        if (notifError) {
          console.error("❌ Notification save error:", notifError);
          console.error("Error details:", JSON.stringify(notifError));
        } else {
          console.log("✅ SUCCESS: Notifications created:", insertedNotifs);
          console.log("✅ Created count:", insertedNotifs?.length);
        }
      } else {
        console.log(
          "⚠️ No notifications to create (owner and tenant same as agent)"
        );
      }

      showToast("Sozlesme olusturuldu! Taraflara davet gonderildi.");

      // Bildirimleri yenile (taraflar görsün)
      setTimeout(() => {
        fetchNotifications();
      }, 1000);

      setCurrentView("dashboard");
      setLoading(false);
    } catch (error) {
      console.error("Contract creation failed:", error);
      showToast(
        "Hata: " + (error.message || "Sozlesme olusturulamadi"),
        "error"
      );
      setLoading(false);
    }
  };

  const handleAcceptInvite = async (notification) => {
    const contract = allContracts.find((c) => c.id === notification.related_id);
    if (!contract) {
      showToast("Sozlesme bulunamadi", "error");
      return;
    }

    setLoading(true);

    try {
      // Bildirimi okundu olarak isaretleme
      const { error: notifError } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notification.id);

      if (notifError) console.error("Notification update error:", notifError);

      // Kontrol: Kim onaylıyor?
      const isOwner = contract.owner_id === currentUser.id;
      const isTenant = contract.tenant_id === currentUser.id;

      if (!isOwner && !isTenant) {
        showToast("Bu sozlesmeyi onaylama yetkiniz yok", "error");
        setLoading(false);
        return;
      }

      // Onay durumunu contracts tablosuna ekleyelim
      // owner_approved ve tenant_approved kolonları olmalı
      let updateData = {};

      if (isOwner) {
        updateData.owner_approved = true;
        console.log("Owner approved contract:", contract.id);
      }

      if (isTenant) {
        updateData.tenant_approved = true;
        console.log("Tenant approved contract:", contract.id);
      }

      // Her iki taraf da onayladiysa Active yap
      const currentContract = allContracts.find((c) => c.id === contract.id);
      const ownerApproved = isOwner
        ? true
        : currentContract.owner_approved || false;
      const tenantApproved = isTenant
        ? true
        : currentContract.tenant_approved || false;

      if (ownerApproved && tenantApproved) {
        updateData.status = "Active";
        console.log("Both parties approved - Contract is now Active!");
      }

      // Supabase'i guncelle
      const { error: updateError } = await supabase
        .from("contracts")
        .update(updateData)
        .eq("id", contract.id);

      if (updateError) {
        console.error("Contract update error:", updateError);
        throw updateError;
      }

      // Local state'i guncelle
      const updatedContracts = allContracts.map((c) =>
        c.id === contract.id ? { ...c, ...updateData } : c
      );
      setAllContracts(updatedContracts);
      saveToLocal("contracts", updatedContracts);

      // Bildirimleri guncelle
      const updatedNotifs = myNotifications.map((n) =>
        n.id === notification.id ? { ...n, read: true } : n
      );
      setMyNotifications(updatedNotifs);

      // Mesaj goster
      if (updateData.status === "Active") {
        showToast("Sozlesme tamamen onaylandi ve aktif hale geldi!");

        // Diger tarafa bildirim gonder
        const otherPartyId = isOwner ? contract.tenant_id : contract.owner_id;
        const property = allProperties.find(
          (p) => p.id === contract.property_id
        );
        const propertyName = property?.title || property?.street || "Mulk";

        if (otherPartyId !== currentUser.id) {
          const notif = {
            user_id: otherPartyId,
            message: `[SOZLESME AKTIF] "${propertyName}" icin sozlesme her iki tarafca onaylandi ve aktif hale geldi!`,
            related_id: contract.id,
            type: "contract_active",
            read: false,
            created_at: new Date().toISOString(),
          };

          await supabase.from("notifications").insert([notif]);
          console.log("Active notification sent to other party");
        }
      } else {
        showToast("Sozlesmeyi onayladiniz. Diger tarafin onayı bekleniyor...");

        // Diger tarafa "bir taraf onayladi" bildirimi gonder
        const otherPartyId = isOwner ? contract.tenant_id : contract.owner_id;
        const property = allProperties.find(
          (p) => p.id === contract.property_id
        );
        const propertyName = property?.title || property?.street || "Mulk";

        if (otherPartyId !== currentUser.id) {
          const notif = {
            user_id: otherPartyId,
            message: `[SOZLESME GUNCELLEME] ${currentUser.name} "${propertyName}" icin sozlesmeyi onayladi. Sizin onayiniz bekleniyor.`,
            related_id: contract.id,
            type: "contract_partial",
            read: false,
            created_at: new Date().toISOString(),
          };

          await supabase.from("notifications").insert([notif]);
          console.log("Partial approval notification sent");
        }
      }

      setLoading(false);
    } catch (error) {
      console.error("Accept invite error:", error);
      showToast("Hata: " + (error.message || "Onaylama basarisiz"), "error");
      setLoading(false);
    }
  };

  const handleRejectInvite = async (notification) => {
    const contract = allContracts.find((c) => c.id === notification.related_id);
    if (!contract) {
      showToast("Sozlesme bulunamadi", "error");
      return;
    }

    setLoading(true);

    try {
      // Sozlesmeyi sil
      const { error: deleteError } = await supabase
        .from("contracts")
        .delete()
        .eq("id", contract.id);

      if (deleteError) {
        console.error("Contract delete error:", deleteError);
        throw deleteError;
      }

      // Local state'ten kaldir
      const updatedContracts = allContracts.filter((c) => c.id !== contract.id);
      setAllContracts(updatedContracts);
      saveToLocal("contracts", updatedContracts);

      // Bildirimi sil
      await supabase.from("notifications").delete().eq("id", notification.id);

      const updatedNotifs = myNotifications.filter(
        (n) => n.id !== notification.id
      );
      setMyNotifications(updatedNotifs);

      // Diger taraflara bildirim gonder (emlakci, diger taraf)
      const property = allProperties.find((p) => p.id === contract.property_id);
      const propertyName = property?.title || property?.street || "Mulk";
      const notifications = [];

      // Emlakciya bildirim
      if (contract.agent_id && contract.agent_id !== currentUser.id) {
        notifications.push({
          user_id: contract.agent_id,
          message: `[SOZLESME RED] ${currentUser.name} "${propertyName}" icin sozlesmeyi reddetti.`,
          related_id: null,
          type: "contract_rejected",
          read: false,
          created_at: new Date().toISOString(),
        });
      }

      // Diger tarafa bildirim (owner veya tenant)
      const isOwner = contract.owner_id === currentUser.id;
      const otherPartyId = isOwner ? contract.tenant_id : contract.owner_id;

      if (otherPartyId !== currentUser.id) {
        notifications.push({
          user_id: otherPartyId,
          message: `[SOZLESME RED] ${currentUser.name} "${propertyName}" icin sozlesmeyi reddetti.`,
          related_id: null,
          type: "contract_rejected",
          read: false,
          created_at: new Date().toISOString(),
        });
      }

      // Bildirimleri kaydet
      if (notifications.length > 0) {
        await supabase.from("notifications").insert(notifications);
        console.log("Rejection notifications sent");
      }

      showToast("Sozlesme reddedildi.", "error");
      setLoading(false);
    } catch (error) {
      console.error("Reject invite error:", error);
      showToast("Hata: " + (error.message || "Reddetme basarisiz"), "error");
      setLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    if (!requestMessage.trim()) return showToast("Mesaj yazın", "error");

    setLoading(true);

    // ✅ RASTGELE ID OLUŞTUR
    const requestId = "REQ" + Math.floor(Math.random() * 9000 + 1000);

    console.log("=== CREATE REQUEST START ===");
    console.log("Request ID:", requestId);
    console.log("Current User:", currentUser.id, currentUser.name);
    console.log("Selected Contract:", selectedContract);

    const newReq = {
      id: requestId, // ✅ ID
      contract_id: selectedContract.id,
      user_id: currentUser.id, // ✅ user_id
      tenant_id: currentUser.id,
      message: requestMessage,
      status: "Open",
      image_urls:
        requestFiles.length > 0
          ? await Promise.all(
              requestFiles.map((f) => uploadFile(f, "request-images"))
            )
          : [],
    };

    try {
      // 1. Veritabanına talebi kaydet
      console.log("Saving request to database:", newReq);

      const { data: insertedRequest, error: requestError } = await supabase
        .from("requests")
        .insert([newReq])
        .select()
        .single();

      if (requestError) {
        console.error("Request save error:", requestError);
        throw requestError;
      }

      console.log("SUCCESS: Request saved to database:", insertedRequest);

      // 2. Ev sahibine ve acenteye bildirim oluştur
      const property = allProperties.find(
        (p) => p.id === selectedContract.property_id
      );
      console.log("Property found:", property);

      if (property) {
        const notifications = [];
        const propertyName = property.title || property.street || "Mülk";
        const now = new Date().toISOString();

        // Mülk sahibine bildirim
        if (property.owner_id !== currentUser.id) {
          notifications.push({
            user_id: property.owner_id,
            message: `[TALEP] ${
              currentUser.name
            } "${propertyName}" için bir talep oluşturdu: "${requestMessage.substring(
              0,
              50
            )}${requestMessage.length > 50 ? "..." : ""}"`,
            related_id: selectedContract.id,
            type: "request",
            read: false,
            created_at: now,
          });
          console.log("Owner notification added");
        }

        // Emlakçıya bildirim
        if (
          selectedContract.agent_id &&
          selectedContract.agent_id !== currentUser.id &&
          selectedContract.agent_id !== property.owner_id
        ) {
          notifications.push({
            user_id: selectedContract.agent_id,
            message: `[TALEP] ${
              currentUser.name
            } "${propertyName}" için bir talep oluşturdu: "${requestMessage.substring(
              0,
              50
            )}${requestMessage.length > 50 ? "..." : ""}"`,
            related_id: selectedContract.id,
            type: "request",
            read: false,
            created_at: now,
          });
          console.log("Agent notification added");
        }

        console.log("Notifications to create:", notifications);
        console.log("Total notifications:", notifications.length);

        if (notifications.length > 0) {
          const { data: insertedNotifs, error: notifError } = await supabase
            .from("notifications")
            .insert(notifications)
            .select();

          if (notifError) {
            console.error("Notification save error:", notifError);
          } else {
            console.log(
              "SUCCESS: Notifications created successfully:",
              insertedNotifs
            );
          }
        } else {
          console.warn("No notifications to create");
        }
      } else {
        console.error(
          "Property not found for contract:",
          selectedContract.property_id
        );
      }

      // 3. Local state'i güncelle
      await fetchAllData();

      console.log("=== CREATE REQUEST END ===");

      showToast("Talep başarıyla iletildi! 🎉");
      setRequestMessage("");
      setRequestFiles([]);
      setCurrentView("contract-detail");
    } catch (error) {
      console.error("=== CREATE REQUEST ERROR ===");
      console.error("Error:", error);
      console.error("Error message:", error.message);
      showToast("Talep gönderilemedi: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentNotify = async () => {
    setLoading(true);

    try {
      console.log("=== PAYMENT NOTIFICATION START ===");
      console.log("Current User:", currentUser.id, currentUser.name);
      console.log("Selected Contract:", selectedContract);

      const property = allProperties.find(
        (p) => p.id === selectedContract.property_id
      );
      if (!property) {
        console.error(
          "Property not found for contract:",
          selectedContract.property_id
        );
        throw new Error("Property not found");
      }

      console.log("Property found:", property);
      console.log("Owner ID:", property.owner_id);
      console.log("Current User ID:", currentUser.id);

      const notifications = [];
      const propertyName = property.title || property.street || "Mülk";

      // Only notify the owner (not the agent) for payment notifications
      console.log("--- CHECKING OWNER ---");
      console.log(
        "Is owner different from current user?",
        property.owner_id !== currentUser.id
      );
      if (property.owner_id !== currentUser.id) {
        console.log("SUCCESS: YES - Adding owner notification");
        const rentAmountFormatted = selectedContract.rent_amount
          ? selectedContract.rent_amount.toLocaleString("tr-TR")
          : "0";
        notifications.push({
          user_id: property.owner_id,
          message: `[ODEME] ${currentUser.name} "${propertyName}" icin kira odemesi yaptigini bildirdi (${rentAmountFormatted} TL)`,
          related_id: selectedContract.id,
          type: "payment",
          read: false,
        });
        console.log("Owner notification added");
      } else {
        console.log("INFO: NO - Owner is current user, skipping");
      }

      console.log("");
      console.log("--- FINAL RESULT ---");
      console.log("Notifications to create:", notifications);
      console.log("Total notifications:", notifications.length);
      console.log("Payment notifications only go to OWNER, not agent");

      if (notifications.length === 0) {
        console.warn(
          "⚠️ No notifications to create - current user is the owner"
        );
        showToast("Ödeme bildirimi kaydedildi", "info");
        return;
      }

      console.log("");
      console.log("--- INSERTING TO DATABASE ---");
      const { data: insertedNotifs, error: notifError } = await supabase
        .from("notifications")
        .insert(notifications)
        .select();

      if (notifError) {
        console.error("ERROR: Notification save error:", notifError);
        throw notifError;
      }

      console.log(
        "SUCCESS: Notifications created successfully:",
        insertedNotifs
      );
      console.log("=== PAYMENT NOTIFICATION END ===");

      showToast("Ödeme bildirimi ev sahibine iletildi! ");
    } catch (error) {
      console.error("=== PAYMENT NOTIFICATION ERROR ===");
      console.error("Error:", error);
      showToast("Ödeme bildirimi iletilemedi: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // PDF İndirme Fonksiyonu
  const handleDownloadContractPDF = async (contract) => {
    try {
      setLoading(true);
      showToast("PDF oluşturuluyor... ", "info");

      // Sözleşme bilgilerini topla
      const property = allProperties.find((p) => p.id === contract.property_id);
      const tenant = users.find((u) => u.id === contract.tenant_id);
      const owner = users.find((u) => u.id === contract.owner_id);
      const agent = users.find((u) => u.id === contract.agent_id);

      // Backend'e PDF oluşturma isteği gönder (simüle edilmiş)
      // Gerçek uygulamada bu bir API çağrısı olacak
      console.log("PDF oluşturuluyor:", {
        contract_id: contract.id,
        property_title: property?.title || property?.street,
        tenant_name: tenant?.name,
        owner_name: owner?.name,
      });

      // Toast mesajı göster
      showToast("✅ PDF indirme başlatıldı! Yakında indirilecek...");

      // Not: Gerçek PDF oluşturma backend'de yapılmalı
      // Şimdilik kullanıcıya bilgi ver
      setTimeout(() => {
        showToast(" PDF özelliği: Backend API entegrasyonu gerekiyor", "info");
      }, 2000);
    } catch (error) {
      console.error("PDF generation error:", error);
      showToast("PDF işlemi başlatılamadı", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async () => {
    if (myNotifications.length === 0) return;

    setLoading(true);

    try {
      // Get all unread notification IDs
      const unreadIds = myNotifications.filter((n) => !n.read).map((n) => n.id);

      if (unreadIds.length === 0) {
        showToast("Tüm bildirimler zaten okundu");
        return;
      }

      // Update in database
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ read: true })
        .in("id", unreadIds);

      if (updateError) {
        console.error("Mark read error:", updateError);
        throw updateError;
      }

      console.log("Notifications marked as read:", unreadIds.length);

      // Update local state
      const updatedNotifs = myNotifications.map((n) => ({ ...n, read: true }));
      setMyNotifications(updatedNotifs);

      showToast("Tüm bildirimler okundu olarak işaretlendi ");
    } catch (error) {
      console.error("Mark read failed:", error);
      showToast("Bildirimler güncellenemedi", "error");
    } finally {
      setLoading(false);
    }
  };

  // Bildirime tıklama - İlgili sayfaya yönlendir
  const handleNotificationClick = async (notification) => {
    console.log("Notification clicked:", notification);

    // Önce bildirimi okundu yap
    if (!notification.read) {
      try {
        await supabase
          .from("notifications")
          .update({ read: true })
          .eq("id", notification.id);

        setMyNotifications(
          myNotifications.map((n) =>
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
      } catch (error) {
        console.error("Mark notification read error:", error);
        // Fallback - local update
        setMyNotifications(
          myNotifications.map((n) =>
            n.id === notification.id ? { ...n, read: true } : n
          )
        );
      }
    }

    // Bildirim tipine göre yönlendir
    if (notification.type === "request") {
      // Talep bildirimi - Sözleşme detayına git ve talepler bölümünü göster
      const contract = allContracts.find(
        (c) => c.id === notification.related_id
      );
      if (contract) {
        setSelectedContract(contract);
        setCurrentView("contract-detail");
        setShowNotifs(false);

        // Sayfa yüklendikten sonra talepler bölümüne scroll
        setTimeout(() => {
          const requestsSection = document.querySelector(".requests-section");
          if (requestsSection) {
            requestsSection.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }
        }, 300);

        showToast(" Talep detayına yönlendirildiniz");
      } else {
        showToast("Sözleşme bulunamadı", "error");
      }
    } else if (notification.type === "payment") {
      // Ödeme bildirimi - Sözleşme detayına git
      const contract = allContracts.find(
        (c) => c.id === notification.related_id
      );
      if (contract) {
        setSelectedContract(contract);
        setCurrentView("contract-detail");
        setShowNotifs(false);
        showToast("Odeme bildiriminin sozlesmesine yonlendirildiniz");
      } else {
        showToast("Sözleşme bulunamadı", "error");
      }
    } else if (notification.type === "contract_invite") {
      // Sözleşme daveti - Onay/Red butonları göster
      const contract = allContracts.find(
        (c) => c.id === notification.related_id
      );
      if (contract) {
        setSelectedContract(contract);
        setCurrentView("contract-detail");
        setShowNotifs(false);
        showToast("Sozlesme davetine yonlendirildiniz");
      } else {
        showToast("Sozlesme bulunamadi", "error");
      }
    } else if (
      notification.type === "contract_active" ||
      notification.type === "contract_partial"
    ) {
      // Sözleşme aktif/kısmi onay - Detaya git
      const contract = allContracts.find(
        (c) => c.id === notification.related_id
      );
      if (contract) {
        setSelectedContract(contract);
        setCurrentView("contract-detail");
        setShowNotifs(false);
        showToast("Sozlesme detayina yonlendirildiniz");
      } else {
        showToast("Sozlesme bulunamadi", "error");
      }
    } else {
      // Diğer bildirim tipleri için
      setShowNotifs(false);
      showToast("Bildirim okundu olarak işaretlendi ", "info");
    }
  };

  const handleAddExpense = async () => {
    if (!expenseForm.name || !expenseForm.amount)
      return showToast("Eksik bilgi", "error");

    const newExp = {
      user_id: currentUser.id,
      name: expenseForm.name,
      category: expenseForm.name,
      amount: parseFloat(expenseForm.amount),
      description: expenseForm.name,
      date: new Date().toLocaleDateString("tr-TR"),
    };

    try {
      const { data, error } = await supabase
        .from("expenses")
        .insert([newExp])
        .select();

      if (error) {
        console.error("Expense save error:", error);
        throw error;
      }

      console.log("Expense saved:", data);

      const allExps = getFromLocal("expenses") || [];
      const updatedExps = data ? [data[0], ...allExps] : [newExp, ...allExps];
      saveToLocal("expenses", updatedExps);

      setSiteExpenses(updatedExps.filter((e) => e.user_id === currentUser.id));

      showToast("Gider kaydedildi ✅");
    } catch (e) {
      console.error("Expense save failed:", e);
      showToast("Gider kaydedilemedi: " + e.message, "error");
    }

    setExpenseForm({ name: "", amount: "" });
    setShowExpenseModal(false);
  };

  const handleDeleteExpense = async (id) => {
    try {
      await supabase.from("expenses").delete().eq("id", id);
    } catch (e) {}

    const allExps = getFromLocal("expenses") || [];
    const updatedExps = allExps.filter((e) => e.id !== id);
    saveToLocal("expenses", updatedExps);

    setSiteExpenses(updatedExps.filter((e) => e.user_id === currentUser.id));
  };

  const calculateIncrease = () => {
    const rent = parseInt(calcForm.currentRent);
    const rate = parseFloat(calcForm.rate);
    if (isNaN(rent) || isNaN(rate)) return;
    const increase = (rent * rate) / 100;
    setCalcResult({
      old: rent,
      rate,
      diff: increase.toFixed(2),
      new: (rent + increase).toFixed(2),
    });
  };

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "50px",
          fontSize: "16px",
          color: "var(--text-secondary)",
        }}
      >
        Yükleniyor...
      </div>
    );

  if (!currentUser) {
    return (
      <div className="login-container">
        {toast && (
          <div
            className="toast"
            style={{
              backgroundColor:
                toast.type === "error"
                  ? "#EF4444"
                  : toast.type === "info"
                  ? "#3b82f6"
                  : "#10B981",
            }}
          >
            <CheckCircle size={16} /> {toast.message}
          </div>
        )}
        <div
          className="card"
          style={{
            width: "380px",
            maxWidth: "90%",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            position: "relative",
            zIndex: 10,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div
              style={{
                display: "inline-flex",
                padding: "16px",
                background:
                  "linear-gradient(135deg, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0.15) 100%)",
                borderRadius: "16px",
                marginBottom: "16px",
              }}
            >
              <Building2 size={40} color="#f97316" />
            </div>
            <h2
              style={{
                margin: "0",
                color: "var(--text-primary)",
                fontSize: "24px",
                fontWeight: "800",
                letterSpacing: "-0.5px",
              }}
            >
              EstateNexus
            </h2>
            <p
              style={{
                color: "var(--text-secondary)",
                marginTop: "6px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              {isLogin ? "Hoş geldin! " : "Yeni Hesap Oluştur"}
            </p>
          </div>
          {!isLogin && (
            <>
              <input
                className="input"
                placeholder="Ad Soyad"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <input
                className="input"
                placeholder="Telefon"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </>
          )}
          <input
            className="input"
            placeholder="E-posta"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {!isLogin && (
            <div className="row gap-10" style={{ marginTop: "16px" }}>
              <button
                className="btn"
                style={{
                  background:
                    selectedRole === "AGENT"
                      ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
                      : "var(--bg-tertiary)",
                  color:
                    selectedRole === "AGENT"
                      ? "white"
                      : "var(--text-secondary)",
                  border:
                    selectedRole === "AGENT"
                      ? "none"
                      : "2px solid var(--border-color)",
                  boxShadow:
                    selectedRole === "AGENT"
                      ? "0 4px 12px rgba(249, 115, 22, 0.3)"
                      : "none",
                }}
                onClick={() => setSelectedRole("AGENT")}
              >
                Danışman
              </button>
              <button
                className="btn"
                style={{
                  background:
                    selectedRole === "CLIENT"
                      ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
                      : "var(--bg-tertiary)",
                  color:
                    selectedRole === "CLIENT"
                      ? "white"
                      : "var(--text-secondary)",
                  border:
                    selectedRole === "CLIENT"
                      ? "none"
                      : "2px solid var(--border-color)",
                  boxShadow:
                    selectedRole === "CLIENT"
                      ? "0 4px 12px rgba(249, 115, 22, 0.3)"
                      : "none",
                }}
                onClick={() => setSelectedRole("CLIENT")}
              >
                Müşteri
              </button>
            </div>
          )}
          <button
            className="btn"
            onClick={isLogin ? handleLogin : handleRegister}
            style={{ marginTop: "18px", width: "100%" }}
          >
            {isLogin ? "Giriş Yap" : "Kayıt Ol"}
          </button>
          <div
            style={{
              textAlign: "center",
              marginTop: "18px",
              cursor: "pointer",
              color: "#f97316",
              fontWeight: "600",
              fontSize: "13px",
            }}
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Hesap Oluştur →" : "← Giriş Yap"}
          </div>
        </div>
      </div>
    );
  }

  const agentContracts = allContracts.filter(
    (c) => c.agent_id === currentUser.id
  );
  const agentClients = [
    ...new Set([
      ...agentContracts.map((c) => c.tenant_id),
      ...agentContracts.map((c) => c.owner_id),
    ]),
  ].filter((id) => id !== currentUser.id);

  return (
    <div className="app-layout">
      {toast && (
        <div
          className="toast"
          style={{
            backgroundColor:
              toast.type === "error"
                ? "#EF4444"
                : toast.type === "info"
                ? "#3b82f6"
                : "#10B981",
          }}
        >
          <CheckCircle size={16} /> {toast.message}
        </div>
      )}

      {/* SIDEBAR */}
      <div className="sidebar">
        <div
          className="logo-area"
          onClick={handleLogoClick}
          style={{ cursor: "pointer", transition: "all 0.3s" }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.05)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          data-tooltip="Ana Sayfaya Dön"
          data-tooltip-pos="right"
        >
          <Building2 size={24} />
          EstateNexus
        </div>

        <div className="nav-links">
          <div
            className={`nav-item ${
              currentView === "dashboard" ? "active" : ""
            }`}
            onClick={() => setCurrentView("dashboard")}
          >
            <LayoutDashboard size={20} />
            Genel Bakış
          </div>

          <div
            className={`nav-item ${
              currentView === "properties" ? "active" : ""
            }`}
            onClick={() => setCurrentView("properties")}
          >
            <Home size={20} />
            Mülklerim
          </div>

          <div
            className={`nav-item ${
              currentView === "contracts" ? "active" : ""
            }`}
            onClick={() => setCurrentView("contracts")}
          >
            <FileText size={20} />
            Sözleşmeler
          </div>

          {/* EMLAKÇIYA ÖZEL SEKME */}
          {currentUser.role === "AGENT" && (
            <div
              className={`nav-item ${
                currentView === "my-contracts" ? "active" : ""
              }`}
              onClick={() => setCurrentView("my-contracts")}
              data-tooltip="Emlakçı Portföyüm"
              data-tooltip-pos="right"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              Portföyüm
            </div>
          )}

          <div
            className={`nav-item ${currentView === "expenses" ? "active" : ""}`}
            onClick={() => setCurrentView("expenses")}
          >
            <Wallet size={20} />
            Giderler
          </div>

          <div
            className={`nav-item ${
              currentView === "calculator" ? "active" : ""
            }`}
            onClick={() => setCurrentView("calculator")}
          >
            <Calculator size={20} />
            Kira Hesapla
          </div>
        </div>

        <div
          className="user-mini-profile"
          onClick={() => setShowProfileModal(true)}
        >
          <img
            key={currentUser.avatar}
            src={currentUser.avatar}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              objectFit: "cover",
            }}
            alt="user"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                currentUser.name
              )}&background=f97316&color=fff&size=128`;
            }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "bold", fontSize: 14 }}>
              {currentUser.name}
            </div>
            <div style={{ fontSize: 11, color: "#64748b" }}>
              {currentUser.role === "AGENT" ? "Danışman" : "Kullanıcı"}
            </div>
          </div>
          <Settings size={18} color="#94a3b8" />
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        <div className="top-header">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="page-header-accent"></div>
            <h2
              style={{
                fontSize: 20,
                margin: 0,
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              {currentView === "dashboard" && "Genel Bakış"}
              {currentView === "properties" && "Mülklerim"}
              {currentView === "contracts" && "Sözleşmeler"}
              {currentView === "my-contracts" && "Portföyüm"}
              {currentView === "expenses" && "Giderler"}
              {currentView === "calculator" && "Kira Hesapla"}
              {currentView === "property-detail" && "Mülk Detayı"}
              {currentView === "contract-detail" && "Sözleşme Detayı"}
              {currentView === "add-property" && "Mülk Ekle"}
              {currentView === "create-contract" && "Yeni Sözleşme"}
              {currentView === "create-request" && "Talep Oluştur"}
            </h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              className={`notification-bell-container ${
                showNotifs ? "active" : ""
              }`}
              onClick={() => {
                fetchNotifications();
                setShowNotifs(!showNotifs);
                setHasNewNotifications(false);
              }}
            >
              <Bell
                size={22}
                color={
                  showNotifs
                    ? "#f97316"
                    : hasNewNotifications
                    ? "#ef4444"
                    : "#64748b"
                }
              />
              {myNotifications.filter((n) => !n.read).length > 0 && (
                <span
                  className={`notification-badge ${
                    hasNewNotifications ? "pulse" : ""
                  }`}
                >
                  {myNotifications.filter((n) => !n.read).length}
                </span>
              )}
            </div>
            <button className="btn btn-secondary" onClick={handleLogout}>
              <LogOut size={16} /> Çıkış
            </button>
          </div>
        </div>

        <div className="page-content">
          <div style={{ padding: "24px 32px" }}>
            {/* DASHBOARD VIEW */}
            {currentView === "dashboard" && (
              <>
                <div
                  className="hero-gradient"
                  style={{
                    padding: "32px",
                    borderRadius: "20px",
                    marginBottom: "28px",
                    boxShadow: "0 12px 32px rgba(79, 70, 229, 0.25)",
                  }}
                >
                  <Wallet
                    style={{
                      position: "absolute",
                      right: "20px",
                      bottom: "-20px",
                      opacity: "0.15",
                      transform: "rotate(-15deg)",
                    }}
                    size={160}
                  />
                  <h2
                    style={{
                      margin: "0",
                      fontSize: "28px",
                      fontWeight: "800",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    Hoş Geldin, {currentUser.name.split(" ")[0]}{" "}
                  </h2>
                  <p
                    style={{
                      margin: "8px 0 0",
                      opacity: "0.9",
                      fontSize: "15px",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    {currentUser.role === "AGENT"
                      ? "Müşterilerini ve portföyünü buradan yönetebilirsin."
                      : "Mülklerini ve giderlerini buradan kolayca yönetebilirsin."}
                  </p>
                  <button
                    // className="btn" <-- DİKKAT: Bu sınıfı SİLİYORUZ!
                    // Çünkü .btn sınıfındaki !important senin yazdığın rengi eziyor olabilir.

                    style={{
                      /* Butonun Temel Şekli (Artık .btn sınıfı olmadığı için elle ekliyoruz) */
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "12px 24px",
                      borderRadius: "10px",
                      border: "none",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      fontWeight: "800",
                      marginTop: "24px",
                      position: "relative",
                      zIndex: 1,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.2)",

                      /* --- RENGİ BURADAN DEĞİŞTİR --- */
                      background:
                        "#f97316" /* ÖRNEK: Turuncu yaptım. İstediğin renk kodunu buraya yaz */,
                      color: "white" /* Yazı rengi */,
                    }}
                    onClick={() => setCurrentView("expenses")}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "translateY(-2px)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "translateY(0)")
                    }
                  >
                    <Wallet size={18} /> Giderleri Yönet →
                  </button>
                </div>

                {/* Stats Cards */}
                {currentUser.role === "AGENT" ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "16px",
                      marginBottom: "28px",
                    }}
                  >
                    <div
                      className="stat-card-hover"
                      style={{
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "16px",
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        transition: "all 0.3s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Toplam Sözleşme
                        </span>
                        <FileText size={20} color="#f97316" />
                      </div>
                      <span
                        style={{
                          fontSize: "32px",
                          fontWeight: "800",
                          color: "var(--text-primary)",
                        }}
                      >
                        {agentContracts.length}
                      </span>
                    </div>
                    <div
                      className="stat-card-hover"
                      style={{
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "16px",
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        transition: "all 0.3s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Müşteriler
                        </span>
                        <Users size={20} color="#06b6d4" />
                      </div>
                      <span
                        style={{
                          fontSize: "32px",
                          fontWeight: "800",
                          color: "var(--text-primary)",
                        }}
                      >
                        {agentClients.length}
                      </span>
                    </div>
                    <div
                      className="stat-card-hover"
                      style={{
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "16px",
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        transition: "all 0.3s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Aktif Sözleşme
                        </span>
                        <CheckCircle size={20} color="#f59e0b" />
                      </div>
                      <span
                        style={{
                          fontSize: "32px",
                          fontWeight: "800",
                          color: "var(--text-primary)",
                        }}
                      >
                        {
                          agentContracts.filter((c) => c.status === "Active")
                            .length
                        }
                      </span>
                    </div>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "16px",
                      marginBottom: "28px",
                    }}
                  >
                    <div
                      className="stat-card-hover"
                      style={{
                        background: "var(--bg-tertiary)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "16px",
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        transition: "all 0.3s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Toplam Mülk
                        </span>
                        <Home size={20} color="#f97316" />
                      </div>
                      <span
                        style={{
                          fontSize: "32px",
                          fontWeight: "800",
                          color: "var(--text-primary)",
                        }}
                      >
                        {
                          allProperties.filter(
                            (p) => p.owner_id === currentUser.id
                          ).length
                        }
                      </span>
                    </div>
                    <div
                      className="stat-card-hover"
                      style={{
                        background: "var(--bg-tertiary)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "16px",
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        transition: "all 0.3s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Aylık Gelir
                        </span>
                        <TrendingUp size={20} color="#10b981" />
                      </div>
                      <span
                        style={{
                          fontSize: "32px",
                          fontWeight: "800",
                          color: "#10b981",
                        }}
                      >
                        {(() => {
                          // Yaklaşım 1: Dolu mülklerden
                          const myRentedOutProperties = allProperties.filter(
                            (p) =>
                              p.owner_id === currentUser.id &&
                              p.status === "Dolu"
                          );
                          let totalIncome = 0;
                          myRentedOutProperties.forEach((property) => {
                            const activeContract = allContracts.find(
                              (c) =>
                                c.property_id === property.id &&
                                c.status === "Active"
                            );
                            if (activeContract) {
                              totalIncome += activeContract.rent_amount || 0;
                            }
                          });

                          // Yaklaşım 2: Doğrudan aktif sözleşmelerden (yedek)
                          const myActiveContracts = allContracts.filter(
                            (c) =>
                              c.owner_id === currentUser.id &&
                              c.status === "Active"
                          );
                          const totalFromContracts = myActiveContracts.reduce(
                            (sum, c) => sum + (c.rent_amount || 0),
                            0
                          );

                          // En yüksek olanı kullan
                          const finalIncome = Math.max(
                            totalIncome,
                            totalFromContracts
                          );

                          return finalIncome.toLocaleString();
                        })()}
                        {" ₺"}
                      </span>
                    </div>
                    <div
                      className="stat-card-hover"
                      style={{
                        background: "var(--bg-tertiary)",
                        border: "1px solid #e2e8f0",
                        borderRadius: "16px",
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                        transition: "all 0.3s",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                            fontWeight: "700",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Aylık Gider
                        </span>
                        <DollarSign size={20} color="#ef4444" />
                      </div>
                      <span
                        style={{
                          fontSize: "32px",
                          fontWeight: "800",
                          color: "#ef4444",
                        }}
                      >
                        {(() => {
                          // Kiracı olarak ödediğim kira
                          const myTenantContracts = allContracts.filter(
                            (c) =>
                              c.tenant_id === currentUser.id &&
                              c.status === "Active"
                          );
                          let totalRent = 0;
                          myTenantContracts.forEach((contract) => {
                            totalRent += contract.rent_amount || 0;
                          });
                          // Site giderleri
                          const totalExpenses =
                            totalRent +
                            siteExpenses.reduce((a, b) => a + b.amount, 0);
                          return totalExpenses.toLocaleString();
                        })()}
                        {" ₺"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "12px",
                    marginBottom: "28px",
                  }}
                >
                  <button
                    className="btn"
                    style={{ width: "auto", padding: "12px 24px" }}
                    onClick={() => setCurrentView("properties")}
                  >
                    <Home size={16} /> Mülkleri Görüntüle
                  </button>
                  <button
                    className="btn btn-secondary"
                    style={{ width: "auto", padding: "12px 24px" }}
                    onClick={() => setCurrentView("contracts")}
                  >
                    <FileText size={16} /> Sözleşmeleri Görüntüle
                  </button>
                </div>

                {/* FINANCIAL CHART & CALENDAR GRID */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: "24px",
                    marginBottom: "28px",
                  }}
                >
                  {/* FINANCIAL ANALYSIS CHART */}
                  <div className="card" style={{ padding: "24px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "20px",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "18px",
                            fontWeight: "700",
                            color: "var(--text-primary)",
                          }}
                        >
                          Finansal Analiz
                        </h3>
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: "13px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Aylık gelir ve gider karşılaştırması
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "16px",
                          fontSize: "12px",
                          fontWeight: "600",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <div
                            style={{
                              width: "12px",
                              height: "12px",
                              borderRadius: "3px",
                              background: "#06b6d4",
                            }}
                          ></div>
                          <span style={{ color: "var(--text-secondary)" }}>
                            Gelir
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <div
                            style={{
                              width: "12px",
                              height: "12px",
                              borderRadius: "3px",
                              background: "#f97316",
                            }}
                          ></div>
                          <span style={{ color: "var(--text-secondary)" }}>
                            Gider
                          </span>
                        </div>
                      </div>
                    </div>
                    <canvas
                      id="financialChart"
                      style={{ maxHeight: "300px" }}
                    ></canvas>
                  </div>

                  {/* CALENDAR & UPCOMING EVENTS */}
                  <div className="card" style={{ padding: "24px" }}>
                    <h3
                      style={{
                        margin: "0 0 16px",
                        fontSize: "18px",
                        fontWeight: "700",
                        color: "var(--text-primary)",
                      }}
                    >
                      Ajanda
                    </h3>

                    {/* Mini Calendar */}
                    <div
                      id="miniCalendar"
                      style={{ marginBottom: "20px" }}
                    ></div>

                    {/* Upcoming Events */}
                    <div
                      style={{
                        borderTop: "1px solid var(--border-color)",
                        paddingTop: "16px",
                      }}
                    >
                      <h4
                        style={{
                          margin: "0 0 12px",
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "var(--text-secondary)",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Yaklaşan Olaylar
                      </h4>
                      <div className="upcoming-events">
                        {(() => {
                          // Upcoming rent payments and contract expirations
                          const today = new Date();
                          const upcomingEvents = [];

                          // Check contracts ending soon (next 30 days)
                          allContracts
                            .filter((c) => c.status === "Active")
                            .forEach((contract) => {
                              if (contract.end_date) {
                                const endDate = new Date(contract.end_date);
                                const daysUntil = Math.ceil(
                                  (endDate - today) / (1000 * 60 * 60 * 24)
                                );
                                if (daysUntil > 0 && daysUntil <= 30) {
                                  const property = allProperties.find(
                                    (p) => p.id === contract.property_id
                                  );
                                  upcomingEvents.push({
                                    type: "contract",
                                    date: endDate,
                                    daysUntil,
                                    text: `${
                                      property?.title ||
                                      property?.street ||
                                      "Mulk"
                                    } - Sozlesme Bitis`,
                                    icon: "[DOC]",
                                  });
                                }
                              }
                            });

                          // Mock rent payment reminders (15th of each month)
                          const nextPaymentDay = new Date(
                            today.getFullYear(),
                            today.getMonth(),
                            15
                          );
                          if (nextPaymentDay < today) {
                            nextPaymentDay.setMonth(
                              nextPaymentDay.getMonth() + 1
                            );
                          }
                          const daysUntilPayment = Math.ceil(
                            (nextPaymentDay - today) / (1000 * 60 * 60 * 24)
                          );

                          if (
                            daysUntilPayment <= 10 &&
                            allProperties.filter(
                              (p) => p.owner_id === currentUser.id
                            ).length > 0
                          ) {
                            upcomingEvents.push({
                              type: "payment",
                              date: nextPaymentDay,
                              daysUntil: daysUntilPayment,
                              text: "Kira Odemesi Gunu",
                              icon: "[PAY]",
                            });
                          }

                          // Sort by date
                          upcomingEvents.sort(
                            (a, b) => a.daysUntil - b.daysUntil
                          );

                          return upcomingEvents.length > 0 ? (
                            upcomingEvents.slice(0, 3).map((event, idx) => (
                              <div
                                key={idx}
                                className="event-item"
                                style={{
                                  padding: "12px",
                                  background: "var(--bg-secondary)",
                                  borderRadius: "10px",
                                  marginBottom: "8px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                  border: "1px solid var(--border-color)",
                                  transition: "all 0.2s",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "24px",
                                    flexShrink: 0,
                                  }}
                                >
                                  {event.icon}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div
                                    style={{
                                      fontSize: "13px",
                                      fontWeight: "600",
                                      color: "var(--text-primary)",
                                      marginBottom: "2px",
                                    }}
                                  >
                                    {event.text}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      color: "var(--text-secondary)",
                                    }}
                                  >
                                    {event.date.toLocaleDateString("tr-TR", {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </div>
                                </div>
                                <div
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: "700",
                                    padding: "4px 8px",
                                    borderRadius: "6px",
                                    background:
                                      event.daysUntil <= 7
                                        ? "#fef3c7"
                                        : "#dbeafe",
                                    color:
                                      event.daysUntil <= 7
                                        ? "#92400e"
                                        : "#1e40af",
                                  }}
                                >
                                  {event.daysUntil} gün
                                </div>
                              </div>
                            ))
                          ) : (
                            <div
                              style={{
                                padding: "20px",
                                textAlign: "center",
                                color: "var(--text-secondary)",
                                fontSize: "13px",
                              }}
                            >
                              Yaklaşan etkinlik yok
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* PROPERTIES VIEW (MÜLKLERIM) */}
            {currentView === "properties" && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                  }}
                >
                  <h2
                    style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}
                  >
                    Mülklerim
                  </h2>
                  {currentUser.role === "CLIENT" && (
                    <button
                      className="btn"
                      style={{ width: "auto", padding: "12px 24px" }}
                      onClick={() => setCurrentView("add-property")}
                    >
                      <Plus size={16} /> Mülk Ekle
                    </button>
                  )}
                </div>

                {allProperties.filter((p) => p.owner_id === currentUser.id)
                  .length > 0 ? (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(320px, 1fr))",
                      gap: "24px",
                    }}
                  >
                    {allProperties
                      .filter((p) => p.owner_id === currentUser.id)
                      .map((property) => {
                        const activeContract = allContracts.find(
                          (c) =>
                            c.property_id === property.id &&
                            c.status === "Active"
                        );
                        return (
                          <div
                            key={property.id}
                            className="card"
                            style={{
                              padding: 0,
                              overflow: "hidden",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              setSelectedProperty(property);
                              setCurrentView("property-detail");
                            }}
                          >
                            <div style={{ position: "relative" }}>
                              <img
                                src={
                                  property.image_urls?.[0] ||
                                  "https://picsum.photos/400/300"
                                }
                                style={{
                                  height: "180px",
                                  width: "100%",
                                  objectFit: "cover",
                                }}
                                alt="property"
                              />
                              <span
                                className={`badge ${
                                  property.status === "Vacant"
                                    ? "badge-success"
                                    : "badge-info"
                                }`}
                                style={{
                                  position: "absolute",
                                  top: "12px",
                                  right: "12px",
                                }}
                              >
                                {activeContract ? "DOLU" : "BOŞ"}
                              </span>
                            </div>
                            <div style={{ padding: "20px" }}>
                              {/* MÜLK ID BADGE */}
                              <div
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: "6px",
                                  padding: "4px 10px",
                                  background: "var(--bg-tertiary)",
                                  border: "1px solid var(--border-color)",
                                  borderRadius: "6px",
                                  marginBottom: "12px",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  color: "var(--text-secondary)",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(property.id);
                                  showToast(
                                    "Mulk ID kopyalandi: " + property.id,
                                    "info"
                                  );
                                }}
                                onMouseEnter={(e) =>
                                  (e.currentTarget.style.background =
                                    "var(--orange-100)")
                                }
                                onMouseLeave={(e) =>
                                  (e.currentTarget.style.background =
                                    "var(--bg-tertiary)")
                                }
                                title="Kopyalamak icin tikla"
                              >
                                <Copy size={12} />
                                ID: {property.id}
                              </div>

                              {/* MÜLK BAŞLIĞI */}
                              <div
                                style={{
                                  fontWeight: "700",
                                  fontSize: "16px",
                                  color: "var(--text-primary)",
                                  marginBottom: "6px",
                                  lineHeight: "1.3",
                                }}
                              >
                                {property.title || property.street}
                              </div>
                              <div
                                style={{
                                  fontSize: "13px",
                                  color: "var(--text-secondary)",
                                  marginBottom: "12px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                              >
                                <MapPin size={14} /> {property.city_info}
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  gap: "12px",
                                  marginBottom: "12px",
                                  paddingTop: "12px",
                                  borderTop: "1px solid #f1f5f9",
                                }}
                              >
                                {property.room_count && (
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      color: "var(--text-secondary)",
                                    }}
                                  >
                                    🏠 {property.room_count}
                                  </span>
                                )}
                                {property.size && (
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      color: "var(--text-secondary)",
                                    }}
                                  >
                                    📏 {property.size}m²
                                  </span>
                                )}
                                {property.floor && (
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      color: "var(--text-secondary)",
                                    }}
                                  >
                                    🏢 {property.floor}. Kat
                                  </span>
                                )}
                              </div>
                              <div
                                style={{
                                  fontWeight: "800",
                                  color: "#f97316",
                                  fontSize: "20px",
                                  marginBottom: "12px",
                                }}
                              >
                                {property.rent_amount.toLocaleString()} ₺
                              </div>
                              {activeContract && (
                                <div
                                  style={{
                                    background: "#cffafe",
                                    padding: "8px 12px",
                                    borderRadius: "8px",
                                    fontSize: "12px",
                                    color: "#0e7490",
                                    fontWeight: "600",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                  }}
                                >
                                  <FileText size={14} /> Aktif Sözleşme Var
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <Home size={64} />
                    <div style={{ fontSize: "15px", marginTop: "8px" }}>
                      Henüz mülk eklemediniz.
                    </div>
                    <button
                      className="btn"
                      style={{
                        marginTop: "16px",
                        width: "auto",
                        padding: "12px 24px",
                      }}
                      onClick={() => setCurrentView("add-property")}
                    >
                      <Plus size={16} /> İlk Mülkünüzü Ekleyin
                    </button>
                  </div>
                )}
              </>
            )}

            {/* CONTRACTS VIEW (SÖZLEŞMELER) */}
            {currentView === "contracts" && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                  }}
                >
                  <h2
                    style={{ fontSize: "24px", fontWeight: "700", margin: 0 }}
                  >
                    Sözleşmeler
                  </h2>
                </div>

                {(() => {
                  // SADECE KİRACI OLARAK KATILDIĞI SÖZLEŞMELER
                  // Mülk sahibi: Mülk detayında görsün
                  // Emlakçı: Portföyüm'de görsün
                  const userContracts = allContracts.filter(
                    (c) => c.tenant_id === currentUser.id
                  );
                  const activeContracts = userContracts.filter(
                    (c) => c.status === "Active"
                  );
                  const pendingContracts = userContracts.filter(
                    (c) => c.status === "Pending"
                  );

                  return (
                    <>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(200px, 1fr))",
                          gap: "16px",
                          marginBottom: "32px",
                        }}
                      >
                        <div
                          className="stat-card-hover"
                          style={{
                            background: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "16px",
                            padding: "20px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "8px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "12px",
                                color: "var(--text-secondary)",
                                fontWeight: "700",
                                textTransform: "uppercase",
                              }}
                            >
                              Toplam
                            </span>
                            <FileText size={20} color="#f97316" />
                          </div>
                          <span
                            style={{
                              fontSize: "32px",
                              fontWeight: "800",
                              color: "var(--text-primary)",
                            }}
                          >
                            {userContracts.length}
                          </span>
                        </div>
                        <div
                          className="stat-card-hover"
                          style={{
                            background: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "16px",
                            padding: "20px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "8px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "12px",
                                color: "var(--text-secondary)",
                                fontWeight: "700",
                                textTransform: "uppercase",
                              }}
                            >
                              Aktif
                            </span>
                            <CheckCircle size={20} color="#06b6d4" />
                          </div>
                          <span
                            style={{
                              fontSize: "32px",
                              fontWeight: "800",
                              color: "#06b6d4",
                            }}
                          >
                            {activeContracts.length}
                          </span>
                        </div>
                        <div
                          className="stat-card-hover"
                          style={{
                            background: "white",
                            border: "1px solid #e2e8f0",
                            borderRadius: "16px",
                            padding: "20px",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: "8px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "12px",
                                color: "var(--text-secondary)",
                                fontWeight: "700",
                                textTransform: "uppercase",
                              }}
                            >
                              Bekleyen
                            </span>
                            <FileText size={20} color="#f59e0b" />
                          </div>
                          <span
                            style={{
                              fontSize: "32px",
                              fontWeight: "800",
                              color: "#f59e0b",
                            }}
                          >
                            {pendingContracts.length}
                          </span>
                        </div>
                      </div>

                      {userContracts.length > 0 ? (
                        <div>
                          {activeContracts.length > 0 && (
                            <div style={{ marginBottom: "32px" }}>
                              <h3
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "700",
                                  color: "var(--text-primary)",
                                  marginBottom: "16px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <CheckCircle size={18} color="#06b6d4" /> Aktif
                                Sözleşmeler ({activeContracts.length})
                              </h3>
                              <div style={{ display: "grid", gap: "16px" }}>
                                {activeContracts.map((contract) => {
                                  const property = allProperties.find(
                                    (p) => p.id === contract.property_id
                                  );
                                  const tenant = users.find(
                                    (u) => u.id === contract.tenant_id
                                  );
                                  const owner = users.find(
                                    (u) => u.id === contract.owner_id
                                  );
                                  return (
                                    <div
                                      key={contract.id}
                                      className="card"
                                      onClick={() => {
                                        setSelectedContract(contract);
                                        setCurrentView("contract-detail");
                                      }}
                                      style={{
                                        cursor: "pointer",
                                        borderLeft: "4px solid #06b6d4",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "start",
                                          marginBottom: "16px",
                                        }}
                                      >
                                        <div style={{ flex: 1 }}>
                                          <div
                                            style={{
                                              fontWeight: "700",
                                              fontSize: "16px",
                                              marginBottom: "6px",
                                              color: "var(--text-primary)",
                                            }}
                                          >
                                            {property?.title ||
                                              property?.street ||
                                              "Bilinmeyen Mülk"}
                                          </div>
                                          <div
                                            style={{
                                              fontSize: "13px",
                                              color: "var(--text-secondary)",
                                              display: "flex",
                                              alignItems: "center",
                                              gap: "6px",
                                            }}
                                          >
                                            <MapPin size={14} />{" "}
                                            {property?.city_info || "-"}
                                          </div>
                                        </div>
                                        <span className="badge badge-success">
                                          {contract.status}
                                        </span>
                                      </div>
                                      <div
                                        style={{
                                          display: "grid",
                                          gridTemplateColumns:
                                            "repeat(auto-fit, minmax(150px, 1fr))",
                                          gap: "16px",
                                          paddingTop: "16px",
                                          borderTop: "1px solid #f1f5f9",
                                        }}
                                      >
                                        <div>
                                          <div
                                            style={{
                                              fontSize: "11px",
                                              color: "var(--text-secondary)",
                                              marginBottom: "4px",
                                            }}
                                          >
                                            Kiracı
                                          </div>
                                          <div
                                            style={{
                                              fontSize: "13px",
                                              fontWeight: "600",
                                              color: "var(--text-primary)",
                                            }}
                                          >
                                            {tenant?.name || "Bilinmiyor"}
                                          </div>
                                        </div>
                                        <div>
                                          <div
                                            style={{
                                              fontSize: "11px",
                                              color: "var(--text-secondary)",
                                              marginBottom: "4px",
                                            }}
                                          >
                                            Ev Sahibi
                                          </div>
                                          <div
                                            style={{
                                              fontSize: "13px",
                                              fontWeight: "600",
                                              color: "var(--text-primary)",
                                            }}
                                          >
                                            {owner?.name || "Bilinmiyor"}
                                          </div>
                                        </div>
                                        <div>
                                          <div
                                            style={{
                                              fontSize: "11px",
                                              color: "var(--text-secondary)",
                                              marginBottom: "4px",
                                            }}
                                          >
                                            Aylık Kira
                                          </div>
                                          <div
                                            style={{
                                              fontSize: "15px",
                                              fontWeight: "700",
                                              color: "#06b6d4",
                                            }}
                                          >
                                            {contract.rent_amount.toLocaleString()}{" "}
                                            ₺
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          {pendingContracts.length > 0 && (
                            <div>
                              <h3
                                style={{
                                  fontSize: "16px",
                                  fontWeight: "700",
                                  color: "var(--text-primary)",
                                  marginBottom: "16px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                <FileText size={18} color="#f59e0b" /> Bekleyen
                                Sözleşmeler ({pendingContracts.length})
                              </h3>
                              <div style={{ display: "grid", gap: "16px" }}>
                                {pendingContracts.map((contract) => {
                                  const property = allProperties.find(
                                    (p) => p.id === contract.property_id
                                  );
                                  const tenant = users.find(
                                    (u) => u.id === contract.tenant_id
                                  );
                                  return (
                                    <div
                                      key={contract.id}
                                      className="card"
                                      onClick={() => {
                                        setSelectedContract(contract);
                                        setCurrentView("contract-detail");
                                      }}
                                      style={{
                                        cursor: "pointer",
                                        borderLeft: "4px solid #f59e0b",
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: "flex",
                                          justifyContent: "space-between",
                                          alignItems: "start",
                                          marginBottom: "16px",
                                        }}
                                      >
                                        <div style={{ flex: 1 }}>
                                          <div
                                            style={{
                                              fontWeight: "700",
                                              fontSize: "16px",
                                              marginBottom: "6px",
                                              color: "var(--text-primary)",
                                            }}
                                          >
                                            {property?.title ||
                                              property?.street ||
                                              "Bilinmeyen Mülk"}
                                          </div>
                                          <div
                                            style={{
                                              fontSize: "13px",
                                              color: "var(--text-secondary)",
                                              display: "flex",
                                              alignItems: "center",
                                              gap: "6px",
                                            }}
                                          >
                                            <MapPin size={14} />{" "}
                                            {property?.city_info || "-"}
                                          </div>
                                        </div>
                                        <span className="badge badge-warning">
                                          {contract.status}
                                        </span>
                                      </div>
                                      <div
                                        style={{
                                          display: "grid",
                                          gridTemplateColumns:
                                            "repeat(auto-fit, minmax(150px, 1fr))",
                                          gap: "16px",
                                          paddingTop: "16px",
                                          borderTop: "1px solid #f1f5f9",
                                        }}
                                      >
                                        <div>
                                          <div
                                            style={{
                                              fontSize: "11px",
                                              color: "var(--text-secondary)",
                                              marginBottom: "4px",
                                            }}
                                          >
                                            Kiracı
                                          </div>
                                          <div
                                            style={{
                                              fontSize: "13px",
                                              fontWeight: "600",
                                              color: "var(--text-primary)",
                                            }}
                                          >
                                            {tenant?.name || "Bilinmiyor"}
                                          </div>
                                        </div>
                                        <div>
                                          <div
                                            style={{
                                              fontSize: "11px",
                                              color: "var(--text-secondary)",
                                              marginBottom: "4px",
                                            }}
                                          >
                                            Aylık Kira
                                          </div>
                                          <div
                                            style={{
                                              fontSize: "15px",
                                              fontWeight: "700",
                                              color: "#f59e0b",
                                            }}
                                          >
                                            {contract.rent_amount.toLocaleString()}{" "}
                                            ₺
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="empty-state">
                          <Briefcase size={64} />
                          <div style={{ fontSize: "15px", marginTop: "8px" }}>
                            Henüz sözleşme yok.
                          </div>
                          {currentUser.role === "AGENT" && (
                            <button
                              className="btn"
                              style={{
                                marginTop: "16px",
                                width: "auto",
                                padding: "12px 24px",
                              }}
                              onClick={() => setCurrentView("create-contract")}
                            >
                              <Plus size={16} /> İlk Sözleşmeyi Oluştur
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  );
                })()}
              </>
            )}

            {currentView === "expenses" && (
              <div>
                <button
                  onClick={() => setCurrentView("dashboard")}
                  style={{
                    color: "#4F46E5",
                    marginBottom: "20px",
                    cursor: "pointer",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "none",
                    border: "none",
                    fontSize: "14px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  <ArrowLeft size={18} /> Geri
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowExpenseModal(true)}
                  style={{
                    marginBottom: "24px",
                    width: "auto",
                    padding: "12px 24px",
                  }}
                >
                  <Plus size={18} /> Yeni Gider Ekle
                </button>
                <div className="card" style={{ padding: 0 }}>
                  {siteExpenses.map((exp) => (
                    <div
                      key={exp.id}
                      style={{
                        padding: "20px",
                        borderBottom: "1px solid #f1f5f9",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f8fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "white")
                      }
                    >
                      <div>
                        <div
                          style={{
                            fontWeight: "700",
                            fontSize: "15px",
                            color: "var(--text-primary)",
                          }}
                        >
                          {exp.name}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text-tertiary)",
                            marginTop: "4px",
                          }}
                        >
                          {exp.date}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "15px",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: "800",
                            color: "#EF4444",
                            fontSize: "16px",
                          }}
                        >
                          -{exp.amount.toLocaleString()} ₺
                        </div>
                        <button
                          className="btn-icon"
                          onClick={() => handleDeleteExpense(exp.id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {siteExpenses.length === 0 && (
                    <div className="empty-state">
                      <Wallet size={64} />
                      <div style={{ fontSize: "15px", marginTop: "8px" }}>
                        Kayıtlı gider yok.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentView === "calculator" && (
              <div>
                <button
                  onClick={() => setCurrentView("dashboard")}
                  style={{
                    color: "#4F46E5",
                    marginBottom: "20px",
                    cursor: "pointer",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "none",
                    border: "none",
                    fontSize: "14px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  <ArrowLeft size={18} /> Geri
                </button>

                <div
                  className="calculator-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                    marginBottom: "20px",
                  }}
                >
                  {/* Hesaplama Formu */}
                  <div className="card">
                    <h3
                      style={{
                        color: "#06b6d4",
                        textAlign: "center",
                        fontSize: "22px",
                        marginBottom: "24px",
                        fontWeight: "700",
                      }}
                    >
                      Kira Artış Hesapla
                    </h3>
                    <input
                      className="input"
                      type="number"
                      placeholder="Mevcut Kira (₺)"
                      value={calcForm.currentRent}
                      onChange={(e) =>
                        setCalcForm({
                          ...calcForm,
                          currentRent: e.target.value,
                        })
                      }
                    />
                    <input
                      className="input"
                      type="number"
                      placeholder="Artış Oranı (%)"
                      value={calcForm.rate}
                      onChange={(e) =>
                        setCalcForm({ ...calcForm, rate: e.target.value })
                      }
                    />
                    <button
                      className="btn"
                      onClick={() => {
                        const r = parseInt(calcForm.currentRent);
                        const p = parseFloat(calcForm.rate);
                        if (r && p)
                          setCalcResult({
                            old: r,
                            new: (r + (r * p) / 100).toFixed(2),
                            diff: ((r * p) / 100).toFixed(2),
                          });
                      }}
                      style={{ marginTop: "16px" }}
                    >
                      <TrendingUp size={18} /> Hesapla
                    </button>
                    {calcResult && (
                      <div
                        style={{
                          marginTop: "20px",
                          padding: "20px",
                          background:
                            "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                          borderRadius: "14px",
                          border: "2px solid #06b6d4",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "12px",
                          }}
                        >
                          <span style={{ color: "#064e3b", fontWeight: "600" }}>
                            Eski Kira:
                          </span>{" "}
                          <strong style={{ color: "#064e3b" }}>
                            {parseFloat(calcResult.old).toLocaleString()} ₺
                          </strong>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "12px",
                            paddingTop: "12px",
                            borderTop: "1px solid #06b6d4",
                          }}
                        >
                          <span style={{ color: "#064e3b", fontWeight: "600" }}>
                            Artış Tutarı:
                          </span>{" "}
                          <strong style={{ color: "#06b6d4" }}>
                            +{parseFloat(calcResult.diff).toLocaleString()} ₺
                          </strong>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            paddingTop: "12px",
                            borderTop: "1px solid #06b6d4",
                          }}
                        >
                          <span
                            style={{
                              color: "#064e3b",
                              fontWeight: "700",
                              fontSize: "16px",
                            }}
                          >
                            Yeni Kira:
                          </span>{" "}
                          <strong
                            style={{ color: "#064e3b", fontSize: "20px" }}
                          >
                            {parseFloat(calcResult.new).toLocaleString()} ₺
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TÜİK Enflasyon Oranları */}
                  <div className="card">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "20px",
                      }}
                    >
                      <h3
                        style={{
                          color: "#f97316",
                          fontSize: "18px",
                          margin: 0,
                          fontWeight: "700",
                        }}
                      >
                        📊 TÜİK Enflasyon Oranları
                      </h3>
                      {tuikLoading && (
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Yükleniyor...
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        background: "rgba(245, 158, 11, 0.15)",
                        padding: "14px",
                        borderRadius: "12px",
                        marginBottom: "16px",
                        border: "1px solid rgba(245, 158, 11, 0.3)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "#92400e",
                          marginBottom: "4px",
                        }}
                      >
                        ℹ️ Bilgilendirme
                      </div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "#78350f",
                          lineHeight: "1.5",
                        }}
                      >
                        Kira artış oranı, TÜFE (Tüketici Fiyat Endeksi) aylık
                        değişim oranlarına göre hesaplanır. Aşağıdaki oranlar
                        son 12 aylık TÜFE verilerini göstermektedir.
                      </div>
                    </div>

                    <div style={{ maxHeight: "420px", overflowY: "auto" }}>
                      {tuikRates.length > 0 ? (
                        tuikRates.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "12px 14px",
                              marginBottom: "8px",
                              background:
                                idx === 0
                                  ? "rgba(59, 130, 246, 0.15)"
                                  : "var(--bg-tertiary)",

                              // Kenarlıkları ayarla
                              border:
                                idx === 0
                                  ? "1px solid #3b82f6"
                                  : "1px solid var(--border-color)",
                              borderRadius: "10px",
                              transition: "all 0.2s",
                              cursor: "pointer",
                            }}
                            onClick={() =>
                              setCalcForm({
                                ...calcForm,
                                rate: item.rate.toString(),
                              })
                            }
                            onMouseEnter={(e) => {
                              if (idx !== 0) {
                                e.currentTarget.style.background = "#f8fafc";
                                e.currentTarget.style.borderColor = "#cbd5e1";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (idx !== 0) {
                                e.currentTarget.style.background = "white";
                                e.currentTarget.style.borderColor = "#e2e8f0";
                              }
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  fontSize: "13px",
                                  fontWeight: idx === 0 ? "700" : "600",
                                  color: "var(--text-primary)",
                                }}
                              >
                                {item.month}
                              </div>
                              {idx === 0 && (
                                <div
                                  style={{
                                    fontSize: "10px",
                                    color: "#3b82f6",
                                    fontWeight: "600",
                                    marginTop: "2px",
                                  }}
                                >
                                  SON AY
                                </div>
                              )}
                            </div>
                            <div
                              style={{
                                fontSize: idx === 0 ? "18px" : "16px",
                                fontWeight: "800",
                                color: idx === 0 ? "#3b82f6" : "#06b6d4",
                                display: "flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              %{item.rate.toFixed(2)}
                              {idx === 0 && (
                                <TrendingUp size={16} color="#3b82f6" />
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div
                          style={{
                            textAlign: "center",
                            padding: "32px",
                            color: "var(--text-tertiary)",
                          }}
                        >
                          <TrendingUp
                            size={48}
                            style={{ margin: "0 auto 12px", opacity: 0.5 }}
                          />
                          <div style={{ fontSize: "13px" }}>
                            Veriler yükleniyor...
                          </div>
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        marginTop: "16px",
                        padding: "12px",
                        background: "#f8fafc",
                        borderRadius: "8px",
                        fontSize: "11px",
                        color: "var(--text-secondary)",
                        lineHeight: "1.5",
                      }}
                    >
                      <strong>İpucu:</strong> Bir oran üzerine tıklayarak
                      otomatik olarak hesaplama formuna ekleyebilirsiniz.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentView === "property-detail" && selectedProperty && (
              <div>
                <button
                  onClick={() => setCurrentView("dashboard")}
                  style={{
                    color: "#4F46E5",
                    marginBottom: "20px",
                    cursor: "pointer",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "none",
                    border: "none",
                    fontSize: "14px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  <ArrowLeft size={18} /> Geri
                </button>
                <div
                  className="card"
                  style={{ padding: 0, overflow: "hidden" }}
                >
                  <ImageGallery images={selectedProperty.image_urls} />
                  <div style={{ padding: "28px" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: "16px",
                      }}
                    >
                      <div>
                        <h2
                          style={{
                            margin: "0 0 8px 0",
                            fontSize: "24px",
                            fontWeight: "800",
                            color: "var(--text-primary)",
                          }}
                        >
                          {selectedProperty.street}
                        </h2>
                        <p
                          style={{
                            color: "var(--text-secondary)",
                            margin: 0,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <MapPin size={16} /> {selectedProperty.city_info}
                        </p>
                      </div>
                      <h3
                        style={{
                          color: "#f97316",
                          margin: 0,
                          fontSize: "28px",
                          fontWeight: "800",
                        }}
                      >
                        {selectedProperty.rent_amount.toLocaleString()} ₺
                      </h3>
                    </div>

                    <div style={{ marginTop: "24px", marginBottom: "24px" }}>
                      <h4
                        style={{
                          fontSize: "14px",
                          fontWeight: "700",
                          color: "var(--text-secondary)",
                          marginBottom: "12px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Mülk Sahibi
                      </h4>
                      <SimplePersonCard
                        userId={selectedProperty.owner_id}
                        roleTitle="Ev Sahibi"
                        color="blue"
                        users={users}
                      />
                    </div>

                    {(() => {
                      const contract = allContracts.find(
                        (c) =>
                          c.property_id === selectedProperty.id &&
                          c.status === "Active"
                      );
                      if (contract) {
                        return (
                          <div
                            style={{ marginTop: "24px", marginBottom: "24px" }}
                          >
                            <h4
                              style={{
                                fontSize: "14px",
                                fontWeight: "700",
                                color: "var(--text-secondary)",
                                marginBottom: "12px",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                              }}
                            >
                              Aktif Sözleşme
                            </h4>
                            <SimplePersonCard
                              userId={contract.tenant_id}
                              roleTitle="Kiracı"
                              color="green"
                              users={users}
                            />
                            <SimplePersonCard
                              userId={contract.agent_id}
                              roleTitle="Emlak Danışmanı"
                              color="orange"
                              users={users}
                            />

                            {/* Sözleşme Detaylarını Görüntüle Butonu */}
                            {currentUser.id === selectedProperty.owner_id && (
                              <button
                                className="btn"
                                onClick={() => {
                                  setSelectedContract(contract);
                                  setCurrentView("contract-detail");
                                }}
                                style={{
                                  marginTop: "16px",
                                  width: "auto",
                                  padding: "12px 24px",
                                }}
                              >
                                <FileText size={16} /> Sözleşme Detaylarını
                                Görüntüle
                              </button>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })()}

                    {currentUser.id === selectedProperty.owner_id && (
                      <button
                        className="btn btn-danger"
                        onClick={() =>
                          handleDeleteProperty(selectedProperty.id)
                        }
                        style={{
                          marginTop: "24px",
                          width: "auto",
                          padding: "12px 24px",
                        }}
                      >
                        <Trash2 size={16} /> Mülkü Sil
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentView === "contract-detail" && selectedContract && (
              <div>
                <button
                  onClick={() => setCurrentView("dashboard")}
                  style={{
                    color: "#4F46E5",
                    marginBottom: "20px",
                    cursor: "pointer",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "none",
                    border: "none",
                    fontSize: "14px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  <ArrowLeft size={18} /> Geri
                </button>
                <div className="card">
                  <h3
                    style={{
                      fontSize: "20px",
                      marginBottom: "24px",
                      fontWeight: "700",
                      color: "var(--text-primary)",
                    }}
                  >
                    Sözleşme Detayı
                  </h3>
                  <div className="table-row">
                    <div className="table-label">Kira</div>
                    <div className="table-value">
                      {selectedContract.rent_amount.toLocaleString()} ₺
                    </div>
                  </div>
                  <div className="table-row">
                    <div className="table-label">IBAN</div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                      }}
                    >
                      <div className="table-value">{selectedContract.iban}</div>
                      <button
                        className="btn-icon"
                        onClick={() => handleCopy(selectedContract.iban)}
                        title="IBAN'ı Kopyala"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="table-row">
                    <div className="table-label">Başlangıç</div>
                    <div className="table-value">
                      {selectedContract.start_date}
                    </div>
                  </div>

                  <div style={{ marginTop: "32px" }}>
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "var(--text-secondary)",
                        marginBottom: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Sözleşme Tarafları
                    </h4>
                    <SimplePersonCard
                      userId={selectedContract.owner_id}
                      roleTitle="Ev Sahibi"
                      color="blue"
                      users={users}
                    />
                    <SimplePersonCard
                      userId={selectedContract.tenant_id}
                      roleTitle="Kiracı"
                      color="green"
                      users={users}
                    />
                    <SimplePersonCard
                      userId={selectedContract.agent_id}
                      roleTitle="Emlak Danışmanı"
                      color="orange"
                      users={users}
                    />
                  </div>

                  {/* YENİ: TALEP GEÇMİŞİ */}
                  <div
                    className="requests-section"
                    style={{ marginTop: "32px", scrollMarginTop: "80px" }}
                  >
                    <h4
                      style={{
                        fontSize: "14px",
                        fontWeight: "700",
                        color: "var(--text-primary)",
                        marginBottom: "12px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <FileText size={16} /> Talep Geçmişi
                    </h4>
                    {(() => {
                      const contractRequests = allRequests.filter(
                        (r) => r.contract_id === selectedContract.id
                      );
                      if (contractRequests.length === 0) {
                        return (
                          <div
                            style={{
                              padding: "24px",
                              background: "#f8fafc",
                              borderRadius: "12px",
                              textAlign: "center",
                              color: "var(--text-tertiary)",
                              fontSize: "13px",
                            }}
                          >
                            Henüz talep bulunmuyor
                          </div>
                        );
                      }
                      return contractRequests.map((req) => {
                        const requester = users.find(
                          (u) => u.id === req.tenant_id
                        );
                        return (
                          <div
                            key={req.id}
                            style={{
                              padding: "16px",
                              background: "white",
                              border: "1px solid #e2e8f0",
                              borderLeft: `4px solid ${
                                req.status === "Open" ? "#f59e0b" : "#06b6d4"
                              }`,
                              borderRadius: "12px",
                              marginBottom: "12px",
                              transition: "all 0.2s",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "start",
                                marginBottom: "10px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "10px",
                                }}
                              >
                                <img
                                  src={requester?.avatar}
                                  style={{
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "8px",
                                    objectFit: "cover",
                                    border: "2px solid #e2e8f0",
                                  }}
                                  alt="avatar"
                                />
                                <div>
                                  <div
                                    style={{
                                      fontWeight: "700",
                                      fontSize: "14px",
                                      color: "var(--text-primary)",
                                    }}
                                  >
                                    {requester?.name || "Bilinmeyen"}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "11px",
                                      color: "var(--text-tertiary)",
                                    }}
                                  >
                                    {req.date}
                                  </div>
                                </div>
                              </div>
                              <span
                                className={`badge ${
                                  req.status === "Open"
                                    ? "badge-warning"
                                    : "badge-success"
                                }`}
                                style={{ fontSize: "10px" }}
                              >
                                {req.status === "Open" ? "Açık" : "Çözüldü"}
                              </span>
                            </div>
                            <div
                              style={{
                                fontSize: "13px",
                                color: "#334155",
                                lineHeight: "1.6",
                                padding: "12px",
                                background: "#f8fafc",
                                borderRadius: "8px",
                                marginTop: "10px",
                              }}
                            >
                              {req.message}
                            </div>
                            {req.image_urls && req.image_urls.length > 0 && (
                              <div
                                style={{
                                  marginTop: "10px",
                                  display: "flex",
                                  gap: "8px",
                                  flexWrap: "wrap",
                                }}
                              >
                                {req.image_urls.map((url, idx) => (
                                  <img
                                    key={idx}
                                    src={url}
                                    style={{
                                      width: "60px",
                                      height: "60px",
                                      borderRadius: "8px",
                                      objectFit: "cover",
                                      border: "2px solid #e2e8f0",
                                    }}
                                    alt="request"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {currentUser.id === selectedContract.tenant_id &&
                    selectedContract.status === "Active" && (
                      <div
                        style={{
                          marginTop: "24px",
                          paddingTop: "20px",
                          borderTop: "1px solid #e2e8f0",
                        }}
                      >
                        <h4
                          style={{
                            marginBottom: "16px",
                            fontSize: "16px",
                            fontWeight: "700",
                            color: "var(--text-primary)",
                          }}
                        >
                          Kiracı İşlemleri
                        </h4>
                        <div className="row gap-10">
                          <button
                            className="btn btn-warning"
                            style={{ width: "auto", padding: "12px 20px" }}
                            onClick={() => setCurrentView("create-request")}
                          >
                            <FileText size={16} /> Talep Oluştur
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ width: "auto", padding: "12px 20px" }}
                            onClick={handlePaymentNotify}
                          >
                            <Wallet size={16} /> Ödeme Yaptım
                          </button>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {currentView === "add-property" && (
              <div className="card">
                <h3
                  style={{
                    fontSize: "20px",
                    marginBottom: "24px",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                  }}
                >
                  Mülk Ekle
                </h3>

                {/* YENİ: MÜLK BAŞLIĞI */}
                <div style={{ marginBottom: "20px" }}>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "var(--text-primary)",
                      marginBottom: "8px",
                      display: "block",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Mülk Başlığı *
                  </label>
                  <input
                    className="input"
                    placeholder="örn: Kadıköy Merkez 3+1 Kiralık Daire"
                    value={propForm.title}
                    onChange={(e) =>
                      setPropForm({ ...propForm, title: e.target.value })
                    }
                    style={{
                      fontSize: "15px",
                      fontWeight: "600",
                      padding: "14px",
                    }}
                  />
                  <div
                    style={{
                      fontSize: "11px",
                      color: "var(--text-tertiary)",
                      marginTop: "6px",
                      fontStyle: "italic",
                    }}
                  >
                    Bu başlık sözleşmelerde ve listelerde görüntülenecek
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "var(--text-primary)",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Adres Bilgileri
                  </label>
                  <input
                    className="input"
                    placeholder="Sokak/Cadde *"
                    value={propForm.street}
                    onChange={(e) =>
                      setPropForm({ ...propForm, street: e.target.value })
                    }
                  />
                  <input
                    className="input"
                    placeholder="Bina Adı"
                    value={propForm.building}
                    onChange={(e) =>
                      setPropForm({ ...propForm, building: e.target.value })
                    }
                  />
                  <input
                    className="input"
                    placeholder="Kapı No"
                    value={propForm.doorNo}
                    onChange={(e) =>
                      setPropForm({ ...propForm, doorNo: e.target.value })
                    }
                  />
                  <input
                    className="input"
                    placeholder="İl/İlçe/Mahalle *"
                    value={propForm.cityInfo}
                    onChange={(e) =>
                      setPropForm({ ...propForm, cityInfo: e.target.value })
                    }
                  />
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "var(--text-secondary)",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Mülk Özellikleri
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    <select
                      className="input"
                      value={propForm.type}
                      onChange={(e) =>
                        setPropForm({ ...propForm, type: e.target.value })
                      }
                    >
                      <option value="">Mülk Tipi *</option>
                      <option value="Daire">Daire</option>
                      <option value="Villa">Villa</option>
                      <option value="Residence">Residence</option>
                      <option value="Müstakil Ev">Müstakil Ev</option>
                      <option value="İşyeri">İşyeri</option>
                      <option value="Ofis">Ofis</option>
                    </select>
                    <select
                      className="input"
                      value={propForm.roomCount}
                      onChange={(e) =>
                        setPropForm({ ...propForm, roomCount: e.target.value })
                      }
                    >
                      <option value="">Oda Sayısı *</option>
                      <option value="1+0">1+0</option>
                      <option value="1+1">1+1</option>
                      <option value="2+1">2+1</option>
                      <option value="3+1">3+1</option>
                      <option value="4+1">4+1</option>
                      <option value="5+1">5+1</option>
                    </select>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    <input
                      className="input"
                      type="number"
                      placeholder="m² (Net Alan) *"
                      value={propForm.size}
                      onChange={(e) =>
                        setPropForm({ ...propForm, size: e.target.value })
                      }
                    />
                    <input
                      className="input"
                      type="number"
                      placeholder="Kira Bedeli (₺) *"
                      value={propForm.rentAmount}
                      onChange={(e) =>
                        setPropForm({ ...propForm, rentAmount: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "var(--text-secondary)",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Bina Bilgileri
                  </label>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: "10px",
                    }}
                  >
                    <input
                      className="input"
                      type="number"
                      placeholder="Bulunduğu Kat"
                      value={propForm.floor}
                      onChange={(e) =>
                        setPropForm({ ...propForm, floor: e.target.value })
                      }
                    />
                    <input
                      className="input"
                      type="number"
                      placeholder="Toplam Kat"
                      value={propForm.totalFloors}
                      onChange={(e) =>
                        setPropForm({
                          ...propForm,
                          totalFloors: e.target.value,
                        })
                      }
                    />
                    <input
                      className="input"
                      type="number"
                      placeholder="Bina Yaşı"
                      value={propForm.buildingAge}
                      onChange={(e) =>
                        setPropForm({
                          ...propForm,
                          buildingAge: e.target.value,
                        })
                      }
                    />
                  </div>
                  <select
                    className="input"
                    value={propForm.heating}
                    onChange={(e) =>
                      setPropForm({ ...propForm, heating: e.target.value })
                    }
                  >
                    <option value="">Isıtma Tipi</option>
                    <option value="Doğalgaz (Kombi)">Doğalgaz (Kombi)</option>
                    <option value="Merkezi Sistem">Merkezi Sistem</option>
                    <option value="Klima">Klima</option>
                    <option value="Soba">Soba</option>
                    <option value="Yok">Yok</option>
                  </select>
                  <select
                    className="input"
                    value={propForm.furnished}
                    onChange={(e) =>
                      setPropForm({ ...propForm, furnished: e.target.value })
                    }
                  >
                    <option value="Boş">Boş</option>
                    <option value="Eşyalı">Eşyalı</option>
                    <option value="Yarı Eşyalı">Yarı Eşyalı</option>
                  </select>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "var(--text-secondary)",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Özellikler
                  </label>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid",
                        transition: "all 0.2s",

                        /* --- RENK MANTIĞI BURADA --- */
                        // SEÇİLİYSE: Yeşil Şeffaf Zemin & Yeşil Kenarlık
                        // SEÇİLİ DEĞİLSE: Koyu Zemin & Koyu Kenarlık
                        background: propForm.balcony
                          ? "rgba(16, 185, 129, 0.15)"
                          : "var(--bg-tertiary)",
                        borderColor: propForm.balcony
                          ? "#10b981"
                          : "var(--border-color)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={propForm.balcony}
                        onChange={(e) =>
                          setPropForm({
                            ...propForm,
                            balcony: e.target.checked,
                          })
                        }
                        // Checkbox'ı gizleyip kendi stilimizi kullanabiliriz ama basitlik için bırakıyoruz
                      />
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: propForm.balcony
                            ? "#10b981"
                            : "var(--text-secondary)",
                        }}
                      >
                        Balkon
                      </span>
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid",
                        transition: "all 0.2s",

                        background: propForm.elevator
                          ? "rgba(16, 185, 129, 0.15)"
                          : "var(--bg-tertiary)",
                        borderColor: propForm.elevator
                          ? "#10b981"
                          : "var(--border-color)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={propForm.elevator}
                        onChange={(e) =>
                          setPropForm({
                            ...propForm,
                            elevator: e.target.checked,
                          })
                        }
                      />
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: propForm.elevator
                            ? "#10b981"
                            : "var(--text-secondary)",
                        }}
                      >
                        Asansör
                      </span>
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        cursor: "pointer",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        border: "1px solid",
                        transition: "all 0.2s",

                        background: propForm.parking
                          ? "rgba(16, 185, 129, 0.15)"
                          : "var(--bg-tertiary)",
                        borderColor: propForm.parking
                          ? "#10b981"
                          : "var(--border-color)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={propForm.parking}
                        onChange={(e) =>
                          setPropForm({
                            ...propForm,
                            parking: e.target.checked,
                          })
                        }
                      />
                      <span
                        style={{
                          fontSize: "14px",
                          fontWeight: "600",
                          color: propForm.parking
                            ? "#10b981"
                            : "var(--text-secondary)",
                        }}
                      >
                        Otopark
                      </span>
                    </label>
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "var(--text-secondary)",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Açıklama
                  </label>
                  <textarea
                    className="input"
                    rows="4"
                    placeholder="Mülk hakkında detaylı açıklama yazın..."
                    value={propForm.description}
                    onChange={(e) =>
                      setPropForm({ ...propForm, description: e.target.value })
                    }
                    style={{ resize: "vertical" }}
                  ></textarea>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "var(--text-secondary)",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Fotoğraflar
                  </label>
                  <input
                    type="file"
                    className="input"
                    accept="image/*"
                    multiple
                    onChange={(e) =>
                      setPropImageFiles(Array.from(e.target.files))
                    }
                    style={{ padding: "10px" }}
                  />
                  {propImageFiles.length > 0 && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#06b6d4",
                        marginTop: "8px",
                        fontWeight: "600",
                      }}
                    >
                      {propImageFiles.length} fotoğraf seçildi
                    </div>
                  )}
                </div>

                <div
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "12px",
                    marginBottom: "16px",
                    padding: "12px",
                    background: "#f8fafc",
                    borderRadius: "8px",
                  }}
                >
                  <strong>*</strong> ile işaretli alanlar zorunludur.
                </div>

                <button
                  className="btn"
                  onClick={handleAddProperty}
                  style={{ marginTop: "16px" }}
                >
                  <Plus size={18} /> Mülkü Kaydet
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ marginTop: "12px" }}
                  onClick={() => setCurrentView("dashboard")}
                >
                  İptal
                </button>
              </div>
            )}

            {currentView === "create-contract" && (
              <div className="card">
                <button
                  onClick={() => setCurrentView("dashboard")}
                  style={{
                    color: "#4F46E5",
                    marginBottom: "20px",
                    cursor: "pointer",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "none",
                    border: "none",
                    fontSize: "14px",
                    padding: "8px 12px",
                    borderRadius: "8px",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "none")
                  }
                >
                  <ArrowLeft size={18} /> Geri
                </button>

                <h3
                  style={{
                    fontSize: "20px",
                    marginBottom: "24px",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                  }}
                >
                  Yeni Sözleşme Oluştur
                </h3>

                <div
                  style={{
                    marginBottom: "24px",
                    padding: "16px",
                    background: "#f0f9ff",
                    borderRadius: "12px",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#1e40af",
                      fontWeight: "600",
                      marginBottom: "8px",
                    }}
                  >
                    {" "}
                    Sozlesme Bilgileri
                  </div>
                  <div
                    style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                  >
                    Mulk ID'sini girerek mulk bilgilerini otomatik doldurun.
                  </div>
                </div>

                {/* ID HELPER SECTION */}
                <div
                  style={{
                    marginBottom: "24px",
                    padding: "16px",
                    background: "var(--bg-secondary)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "13px",
                      fontWeight: "700",
                      color: "var(--text-primary)",
                      marginBottom: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Copy size={16} />
                    Hizli Erisim - ID Listesi
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "16px",
                    }}
                  >
                    {/* Mülkler */}
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "var(--text-secondary)",
                          marginBottom: "8px",
                        }}
                      >
                        Mulkleriniz:
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          maxHeight: "120px",
                          overflowY: "auto",
                        }}
                      >
                        {allProperties
                          .filter((p) => p.owner_id === currentUser.id)
                          .slice(0, 5)
                          .map((prop) => (
                            <div
                              key={prop.id}
                              onClick={() => {
                                setContractForm({
                                  ...contractForm,
                                  propertyId: prop.id,
                                });
                                navigator.clipboard.writeText(prop.id);
                                showToast(
                                  "Mulk ID kopyalandi: " + prop.id,
                                  "info"
                                );
                              }}
                              style={{
                                padding: "8px 10px",
                                background: "var(--bg-primary)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "6px",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                fontSize: "11px",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.borderColor = "#f97316")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.borderColor =
                                  "var(--border-color)")
                              }
                            >
                              <div
                                style={{
                                  fontWeight: "600",
                                  color: "var(--text-primary)",
                                  marginBottom: "2px",
                                }}
                              >
                                {prop.id}
                              </div>
                              <div
                                style={{
                                  color: "var(--text-secondary)",
                                  fontSize: "10px",
                                }}
                              >
                                {prop.title || prop.street}
                              </div>
                            </div>
                          ))}
                        {allProperties.filter(
                          (p) => p.owner_id === currentUser.id
                        ).length === 0 && (
                          <div
                            style={{
                              fontSize: "11px",
                              color: "var(--text-secondary)",
                              fontStyle: "italic",
                            }}
                          >
                            Henuz mulk yok
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Kullanıcılar */}
                    <div>
                      <div
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "var(--text-secondary)",
                          marginBottom: "8px",
                        }}
                      >
                        Kullanicilar:
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          maxHeight: "120px",
                          overflowY: "auto",
                        }}
                      >
                        {users
                          .filter((u) => u.id !== currentUser.id)
                          .slice(0, 5)
                          .map((user) => (
                            <div
                              key={user.id}
                              onClick={() => {
                                setContractForm({
                                  ...contractForm,
                                  tenantId: user.id,
                                });
                                navigator.clipboard.writeText(user.id);
                                showToast(
                                  "Kullanici ID kopyalandi: " + user.id,
                                  "info"
                                );
                              }}
                              style={{
                                padding: "8px 10px",
                                background: "var(--bg-primary)",
                                border: "1px solid var(--border-color)",
                                borderRadius: "6px",
                                cursor: "pointer",
                                transition: "all 0.2s",
                                fontSize: "11px",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.borderColor = "#06b6d4")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.borderColor =
                                  "var(--border-color)")
                              }
                            >
                              <div
                                style={{
                                  fontWeight: "600",
                                  color: "var(--text-primary)",
                                  marginBottom: "2px",
                                }}
                              >
                                {user.id}
                              </div>
                              <div
                                style={{
                                  color: "var(--text-secondary)",
                                  fontSize: "10px",
                                }}
                              >
                                {user.name} ({user.role})
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "12px",
                      padding: "8px 10px",
                      background: "rgba(249, 115, 22, 0.1)",
                      borderRadius: "6px",
                      fontSize: "11px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <strong>Ipucu:</strong> ID'leri tiklayarak kopyalayabilir ve
                    forma yapistirabilirsini z.
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "var(--text-secondary)",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Mülk ID
                  </label>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <input
                      className="input"
                      placeholder="Mülk ID (örn: P101)"
                      value={contractForm.propertyId}
                      onChange={(e) =>
                        setContractForm({
                          ...contractForm,
                          propertyId: e.target.value,
                        })
                      }
                      style={{ flex: 1 }}
                    />
                    <button
                      className="btn btn-secondary"
                      onClick={checkPropertyId}
                      style={{ width: "auto", padding: "0 24px" }}
                    >
                      Doğrula
                    </button>
                  </div>
                </div>

                {contractForm.foundProperty && (
                  <>
                    <div
                      style={{
                        marginBottom: "24px",
                        padding: "16px",
                        background: "#f0fdf4",
                        borderRadius: "12px",
                        border: "2px solid #06b6d4",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "13px",
                          color: "#065f46",
                          fontWeight: "700",
                          marginBottom: "8px",
                        }}
                      >
                        {" "}
                        Mülk Bulundu
                      </div>
                      <div
                        style={{
                          fontSize: "14px",
                          color: "var(--text-primary)",
                          fontWeight: "600",
                        }}
                      >
                        {contractForm.street}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                          marginTop: "4px",
                        }}
                      >
                        {contractForm.building} - {contractForm.cityInfo}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "var(--text-secondary)",
                          marginTop: "4px",
                        }}
                      >
                        Tip: {contractForm.type}
                      </div>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "var(--text-secondary)",
                          marginBottom: "8px",
                          display: "block",
                        }}
                      >
                        Kiracı ID
                      </label>
                      <input
                        className="input"
                        placeholder="Kiracı Kullanıcı ID (örn: U1)"
                        value={contractForm.tenantId}
                        onChange={(e) =>
                          setContractForm({
                            ...contractForm,
                            tenantId: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "var(--text-secondary)",
                          marginBottom: "8px",
                          display: "block",
                        }}
                      >
                        Ev Sahibi
                      </label>
                      <input
                        className="input"
                        value={contractForm.landlordName}
                        disabled
                        style={{ background: "#f8fafc", cursor: "not-allowed" }}
                      />
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "var(--text-secondary)",
                          marginBottom: "8px",
                          display: "block",
                        }}
                      >
                        Kira Bedeli
                      </label>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "10px",
                        }}
                      >
                        <input
                          className="input"
                          type="number"
                          placeholder="Kira Tutarı (₺)"
                          value={contractForm.rentAmount}
                          onChange={(e) => {
                            const amount = e.target.value;
                            setContractForm({
                              ...contractForm,
                              rentAmount: amount,
                              rentAmountText: amount
                                ? numberToTurkishWords(parseInt(amount))
                                : "",
                            });
                          }}
                        />
                        <input
                          className="input"
                          type="number"
                          placeholder="Depozito (₺)"
                          value={contractForm.depositAmount}
                          onChange={(e) =>
                            setContractForm({
                              ...contractForm,
                              depositAmount: e.target.value,
                            })
                          }
                        />
                      </div>
                      {contractForm.rentAmountText && (
                        <div
                          style={{
                            fontSize: "11px",
                            color: "var(--text-secondary)",
                            marginTop: "8px",
                            fontStyle: "italic",
                          }}
                        >
                          Yazıyla: {contractForm.rentAmountText}
                        </div>
                      )}
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "var(--text-secondary)",
                          marginBottom: "8px",
                          display: "block",
                        }}
                      >
                        Ödeme Bilgileri
                      </label>
                      <select
                        className="input"
                        value={contractForm.paymentMethod}
                        onChange={(e) =>
                          setContractForm({
                            ...contractForm,
                            paymentMethod: e.target.value,
                          })
                        }
                      >
                        <option value="Banka Hesabına Havale/EFT">
                          Banka Hesabına Havale/EFT
                        </option>
                        <option value="Nakit">Nakit</option>
                        <option value="Çek">Çek</option>
                      </select>
                      <input
                        className="input"
                        placeholder="IBAN (TR ile başlayan)"
                        value={contractForm.landlordIBAN}
                        onChange={(e) =>
                          setContractForm({
                            ...contractForm,
                            landlordIBAN: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "var(--text-secondary)",
                          marginBottom: "8px",
                          display: "block",
                        }}
                      >
                        Sözleşme Detayları
                      </label>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "10px",
                        }}
                      >
                        <input
                          className="input"
                          placeholder="Süre (örn: 1 YIL)"
                          value={contractForm.duration}
                          onChange={(e) =>
                            setContractForm({
                              ...contractForm,
                              duration: e.target.value,
                            })
                          }
                        />
                        <input
                          className="input"
                          placeholder="Başlangıç Tarihi"
                          value={contractForm.startDate}
                          onChange={(e) =>
                            setContractForm({
                              ...contractForm,
                              startDate: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label
                        style={{
                          fontSize: "13px",
                          fontWeight: "600",
                          color: "var(--text-secondary)",
                          marginBottom: "8px",
                          display: "block",
                        }}
                      >
                        Ek Şartlar / Notlar
                      </label>
                      <textarea
                        className="input"
                        rows="4"
                        placeholder="Sözleşmeye eklenecek özel şartlar..."
                        value={contractForm.fixtures}
                        onChange={(e) =>
                          setContractForm({
                            ...contractForm,
                            fixtures: e.target.value,
                          })
                        }
                        style={{ resize: "vertical" }}
                      />
                    </div>

                    <button
                      className="btn"
                      onClick={handleCreateContract}
                      style={{ marginTop: "16px" }}
                    >
                      <FileText size={18} /> Sözleşmeyi Oluştur
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ marginTop: "12px" }}
                      onClick={() => setCurrentView("dashboard")}
                    >
                      İptal
                    </button>
                  </>
                )}

                {!contractForm.foundProperty && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "32px",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    <FileText
                      size={48}
                      style={{ margin: "0 auto 16px", opacity: 0.5 }}
                    />
                    <div style={{ fontSize: "14px" }}>
                      Önce mülk ID'sini girin ve doğrulayın
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentView === "create-request" && (
              <div className="card">
                <h3
                  style={{
                    fontSize: "20px",
                    marginBottom: "24px",
                    fontWeight: "700",
                    color: "var(--text-primary)",
                  }}
                >
                  Talep Bildir
                </h3>

                <textarea
                  className="input"
                  rows="5"
                  placeholder="Talebinizi detaylı yazın..."
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  style={{ resize: "vertical", marginBottom: "24px" }}
                ></textarea>

                {/* Fotoğraf Yükleme Alanı */}
                <div style={{ marginBottom: "24px" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "var(--text-secondary)",
                      marginBottom: "12px",
                    }}
                  >
                    Fotoğraf Ekle (Opsiyonel)
                  </label>

                  <label
                    className={`upload-zone ${dragOver ? "drag-over" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      handleRequestFileUpload(e.dataTransfer.files);
                    }}
                    style={{
                      display: "block",
                      marginBottom: requestFiles.length > 0 ? "16px" : "0",
                    }}
                  >
                    <div className="upload-zone-icon">
                      <svg
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <div className="upload-zone-text">Fotoğraf Ekle</div>
                    <div className="upload-zone-hint">
                      veya tıklayarak seç (PNG, JPG)
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleRequestFileUpload(e.target.files)}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        opacity: 0,
                        cursor: "pointer",
                      }}
                    />
                  </label>

                  {requestFiles.length > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(100px, 1fr))",
                        gap: "12px",
                        padding: "16px",
                        background: "var(--bg-secondary)",
                        borderRadius: "12px",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      {requestFiles.map((file, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: "relative",
                            width: "100%",
                            paddingBottom: "100%",
                            borderRadius: "8px",
                            overflow: "hidden",
                            border: "2px solid var(--border-color)",
                            background: "white",
                          }}
                        >
                          <img
                            src={URL.createObjectURL(file)}
                            alt={file.name}
                            style={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                          <button
                            onClick={() =>
                              setRequestFiles(
                                requestFiles.filter((_, i) => i !== idx)
                              )
                            }
                            style={{
                              position: "absolute",
                              top: "4px",
                              right: "4px",
                              background: "rgba(239, 68, 68, 0.95)",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: "24px",
                              height: "24px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              cursor: "pointer",
                              padding: 0,
                              transition: "all 0.2s",
                              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            }}
                            onMouseEnter={(e) =>
                              (e.target.style.background =
                                "rgba(220, 38, 38, 1)")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.background =
                                "rgba(239, 68, 68, 0.95)")
                            }
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  className="btn"
                  onClick={handleCreateRequest}
                  style={{ marginTop: "8px" }}
                >
                  <FileText size={18} /> Gönder
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ marginTop: "12px" }}
                  onClick={() => setCurrentView("contract-detail")}
                >
                  Vazgeç
                </button>
              </div>
            )}

            {/* EMLAKÇI SÖZLEŞMELERİM SAYFASI */}
            {currentView === "my-contracts" && currentUser.role === "AGENT" && (
              <div className="fade-in">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        margin: "0 0 8px 0",
                        fontSize: "24px",
                        fontWeight: "700",
                        color: "var(--text-primary)",
                      }}
                    >
                      Portföyüm
                    </h2>
                    <p
                      style={{
                        margin: 0,
                        color: "var(--text-secondary)",
                        fontSize: "14px",
                      }}
                    >
                      Yönettiğiniz tüm sözleşmeler ve müşteriler
                    </p>
                  </div>
                  <button
                    className="btn"
                    onClick={() => setCurrentView("create-contract")}
                    data-tooltip="Yeni Sözleşme Oluştur"
                  >
                    <Plus size={18} /> Yeni Sözleşme
                  </button>
                </div>

                {/* Stats */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "16px",
                    marginBottom: "24px",
                  }}
                >
                  <div className="card" style={{ padding: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "12px",
                          background:
                            "linear-gradient(135deg, rgba(249, 115, 22, 0.15) 0%, rgba(249, 115, 22, 0.05) 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FileText size={24} color="#f97316" />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "24px",
                            fontWeight: "700",
                            color: "var(--text-primary)",
                          }}
                        >
                          {agentContracts.length}
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Toplam Sözleşme
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ padding: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "12px",
                          background:
                            "linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <CheckCircle size={24} color="#06b6d4" />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "24px",
                            fontWeight: "700",
                            color: "var(--text-primary)",
                          }}
                        >
                          {
                            agentContracts.filter((c) => c.status === "Active")
                              .length
                          }
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Aktif Sözleşme
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ padding: "16px" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "12px",
                          background:
                            "linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Clock size={24} color="#f59e0b" />
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "24px",
                            fontWeight: "700",
                            color: "var(--text-primary)",
                          }}
                        >
                          {
                            agentContracts.filter((c) => c.status === "Pending")
                              .length
                          }
                        </div>
                        <div
                          style={{
                            fontSize: "12px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          Bekleyen
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tablo */}
                <div className="contracts-table-container">
                  <table className="contracts-table">
                    <thead>
                      <tr>
                        <th>Sözleşme No</th>
                        <th>Mülk Adresi</th>
                        <th>Kiracı</th>
                        <th>Kira Bedeli</th>
                        <th>Başlangıç</th>
                        <th>Bitiş</th>
                        <th>Durum</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {agentContracts.length === 0 ? (
                        <tr>
                          <td
                            colSpan="8"
                            style={{
                              textAlign: "center",
                              padding: "40px",
                              color: "var(--text-tertiary)",
                            }}
                          >
                            <FileText
                              size={48}
                              style={{ margin: "0 auto 16px", opacity: 0.3 }}
                            />
                            <div>Henüz sözleşme bulunmuyor</div>
                          </td>
                        </tr>
                      ) : (
                        agentContracts.map((contract) => {
                          const property = allProperties.find(
                            (p) => p.id === contract.property_id
                          );
                          const tenant = users.find(
                            (u) => u.id === contract.tenant_id
                          );

                          return (
                            <tr
                              key={contract.id}
                              onClick={() => {
                                setSelectedContract(contract);
                                setCurrentView("contract-detail");
                              }}
                            >
                              <td>
                                <span className="contract-no">
                                  #{String(contract.id).slice(-6).toUpperCase()}
                                </span>
                              </td>
                              <td>
                                <div
                                  style={{
                                    fontWeight: "600",
                                    color: "var(--text-primary)",
                                  }}
                                >
                                  {property?.title || property?.street || "N/A"}
                                </div>
                                <div
                                  style={{
                                    fontSize: "12px",
                                    color: "var(--text-secondary)",
                                  }}
                                >
                                  {property?.city_info || property?.city || ""}
                                </div>
                              </td>
                              <td>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "32px",
                                      height: "32px",
                                      borderRadius: "50%",
                                      background:
                                        "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                                      color: "white",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "12px",
                                      fontWeight: "700",
                                    }}
                                  >
                                    {tenant?.name?.charAt(0) || "K"}
                                  </div>
                                  <span style={{ fontWeight: "500" }}>
                                    {tenant?.name || "Kiracı"}
                                  </span>
                                </div>
                              </td>
                              <td>
                                <span
                                  style={{
                                    fontWeight: "700",
                                    color: "var(--orange-500)",
                                    fontSize: "15px",
                                  }}
                                >
                                  {contract.rent_amount
                                    ? contract.rent_amount.toLocaleString()
                                    : "0"}{" "}
                                  ₺
                                </span>
                              </td>
                              <td>
                                {contract.start_date
                                  ? new Date(
                                      contract.start_date
                                    ).toLocaleDateString("tr-TR")
                                  : "-"}
                              </td>
                              <td>
                                {contract.end_date
                                  ? new Date(
                                      contract.end_date
                                    ).toLocaleDateString("tr-TR")
                                  : "-"}
                              </td>
                              <td>
                                <span
                                  className={`contract-status-badge contract-status-${
                                    contract.status === "Active"
                                      ? "active"
                                      : contract.status === "Pending"
                                      ? "pending"
                                      : "expired"
                                  }`}
                                >
                                  {contract.status === "Active"
                                    ? " Aktif"
                                    : contract.status === "Pending"
                                    ? " Bekliyor"
                                    : "✗ Sona Erdi"}
                                </span>
                              </td>
                              <td>
                                <div className="contract-actions">
                                  <button
                                    className="icon-button"
                                    data-tooltip="Detayları Gör"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedContract(contract);
                                      setCurrentView("contract-detail");
                                    }}
                                  >
                                    <Eye size={16} />
                                  </button>
                                  <button
                                    className="icon-button"
                                    data-tooltip="PDF İndir"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDownloadContractPDF(contract);
                                    }}
                                  >
                                    <Download size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODALS */}
      {showProfileModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.className === "modal-overlay")
              setShowProfileModal(false);
          }}
        >
          <div className="modal-content">
            <div
              className="hero-gradient"
              style={{
                height: "100px",
                borderRadius: "24px 24px 0 0",
                margin: "-32px -32px 50px -32px",
              }}
            ></div>

            <div
              style={{
                position: "absolute",
                top: "50px",
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <img
                key={currentUser.avatar}
                src={currentUser.avatar}
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  border: "5px solid white",
                  objectFit: "cover",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                  backgroundColor: "#f1f5f9",
                }}
                alt="big-avatar"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    currentUser.name
                  )}&background=f97316&color=fff&size=128`;
                }}
              />
              <label
                htmlFor="avatar-upload"
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  background: uploadingAvatar
                    ? "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)"
                    : "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  color: "white",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: uploadingAvatar ? "not-allowed" : "pointer",
                  border: "3px solid white",
                  boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)",
                  pointerEvents: uploadingAvatar ? "none" : "auto",
                }}
              >
                {uploadingAvatar ? (
                  <Upload size={16} className="rotating" />
                ) : (
                  <Camera size={16} />
                )}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                hidden
                onChange={handleAvatarChange}
                disabled={uploadingAvatar}
              />
            </div>

            <button
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "rgba(255,255,255,0.95)",
                backdropFilter: "blur(8px)",
                borderRadius: "50%",
                padding: "8px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              onClick={() => setShowProfileModal(false)}
            >
              <X size={20} color="#64748b" />
            </button>

            <div style={{ textAlign: "center", marginTop: "10px" }}>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "20px",
                  color: "var(--text-primary)",
                  fontWeight: "700",
                }}
              >
                {currentUser.name}
              </h3>
              <span className="badge badge-info">{currentUser.role}</span>

              {/* USER ID BADGE */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "6px 12px",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  marginTop: "12px",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onClick={() => {
                  navigator.clipboard.writeText(currentUser.id);
                  showToast(
                    "Kullanici ID kopyalandi: " + currentUser.id,
                    "info"
                  );
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--orange-100)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "var(--bg-tertiary)")
                }
                title="Kopyalamak icin tikla"
              >
                <Copy size={14} />
                Kullanici ID: {currentUser.id}
              </div>
            </div>

            <div style={{ marginTop: "32px" }}>
              <div className="profile-info-row">
                <span
                  style={{
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <User size={16} /> E-posta
                </span>
                <span
                  style={{ fontWeight: "600", color: "var(--text-primary)" }}
                >
                  {currentUser.email}
                </span>
              </div>
              <div className="profile-info-row">
                <span style={{ color: "var(--text-secondary)" }}>Telefon</span>
                <span
                  style={{ fontWeight: "600", color: "var(--text-primary)" }}
                >
                  {currentUser.phone || "-"}
                </span>
              </div>
              <div className="profile-info-row">
                <span
                  style={{
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Calendar size={16} /> Üyelik
                </span>
                <span
                  style={{ fontWeight: "600", color: "var(--text-primary)" }}
                >
                  Ocak 2025
                </span>
              </div>
            </div>

            <div className="row gap-10" style={{ marginTop: "32px" }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setShowProfileModal(false);
                  openProfileEdit();
                }}
              >
                <Settings size={16} /> Düzenle
              </button>
              <button className="btn btn-danger" onClick={handleLogout}>
                <LogOut size={16} /> Çıkış
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BİLDİRİM MODALI (DÜZELTİLMİŞ TAM KOD) */}
      {/* --- BİLDİRİM MODALI (TAM VE DÜZELTİLMİŞ) --- */}
      {showNotifs && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.className === "modal-overlay") setShowNotifs(false);
          }}
        >
          <div
            className="modal-content"
            style={{
              maxWidth: "500px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              padding: "0", // Padding'i içeriye dağıtacağız
            }}
          >
            {/* 1. HEADER KISMI */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px 24px",
                borderBottom: "1px solid var(--border-color)",
                flexShrink: 0,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Bell size={20} color="#f97316" />
                <span
                  style={{
                    fontWeight: "700",
                    fontSize: "16px",
                    color: "var(--text-primary)",
                  }}
                >
                  Bildirimler{" "}
                  {myNotifications.filter((n) => !n.read).length > 0 &&
                    `(${myNotifications.filter((n) => !n.read).length})`}
                </span>
              </div>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  color: "var(--text-secondary)",
                }}
                onClick={() => setShowNotifs(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* 2. LİSTE KISMI (SCROLL EDİLEBİLİR ALAN) */}
            <div
              style={{
                overflowY: "auto",
                padding: "20px 24px",
                flex: 1,
              }}
            >
              {myNotifications.length === 0 ? (
                <div className="empty-state">
                  <Bell size={48} />
                  <div style={{ fontSize: "14px", marginTop: "12px" }}>
                    Bildirim yok.
                  </div>
                </div>
              ) : (
                myNotifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    style={{
                      padding: "16px",
                      marginBottom: "12px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      position: "relative",

                      /* --- RENK DÜZELTMESİ --- */
                      background: n.read
                        ? "var(--bg-primary)"
                        : "rgba(59, 130, 246, 0.15)",

                      border: n.read
                        ? "1px solid var(--border-color)"
                        : "2px solid #3b82f6",

                      boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
                    }}
                  >
                    {/* İKON ALANI */}
                    <div
                      style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "var(--bg-tertiary)",
                        border: "1px solid var(--border-color)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {n.type === "request" ? (
                        <FileText size={16} color="#f97316" />
                      ) : n.type === "payment" ? (
                        <DollarSign size={16} color="#06b6d4" />
                      ) : n.type === "contract_invite" ? (
                        <FileText size={16} color="#a855f7" />
                      ) : (
                        <Bell size={16} color="#64748b" />
                      )}
                    </div>

                    {/* MESAJ */}
                    <div
                      style={{
                        fontWeight: n.read ? "500" : "700",
                        color: "var(--text-primary)",
                        marginBottom: "8px",
                        lineHeight: "1.5",
                        paddingRight: "40px",
                        fontSize: "13px",
                      }}
                    >
                      {n.message}
                    </div>

                    {/* BUTONLAR (Sadece Davetler İçin) */}
                    {n.type === "contract_invite" && !n.read && (
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginTop: "12px",
                          paddingTop: "12px",
                          borderTop: "1px solid var(--border-color)",
                        }}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAcceptInvite(n);
                          }}
                          style={{
                            flex: 1,
                            padding: "8px",
                            borderRadius: "8px",
                            border: "none",
                            background: "#10b981",
                            color: "white",
                            fontWeight: "700",
                            fontSize: "12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <Check size={14} /> Onayla
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Reddetmek istiyor musunuz?"))
                              handleRejectInvite(n);
                          }}
                          style={{
                            flex: 1,
                            padding: "8px",
                            borderRadius: "8px",
                            border: "none",
                            background: "#ef4444",
                            color: "white",
                            fontWeight: "700",
                            fontSize: "12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "6px",
                          }}
                        >
                          <X size={14} /> Reddet
                        </button>
                      </div>
                    )}

                    {/* ALT BİLGİ */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "11px",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {n.created_at
                          ? new Date(n.created_at).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "long",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          color: "#f97316",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        Detaylar{" "}
                        <ArrowLeft
                          size={12}
                          style={{ transform: "rotate(180deg)" }}
                        />
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 3. FOOTER KISMI (OKUNDU İŞARETLE) */}
            {myNotifications.filter((n) => !n.read).length > 0 && (
              <div
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid var(--border-color)",
                  flexShrink: 0,
                }}
              >
                <button
                  className="btn btn-secondary"
                  onClick={handleMarkRead}
                  style={{ width: "100%", fontSize: "13px" }}
                >
                  <CheckCircle size={16} /> Tümünü Okundu İşaretle
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* PROFİL DÜZENLEME MODALI */}
      {showProfileEditModal && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.className === "modal-overlay")
              setShowProfileEditModal(false);
          }}
        >
          <div className="modal-content" style={{ maxWidth: "600px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                }}
              >
                Profil Bilgilerini Düzenle
              </h3>
              <button
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  color: "var(--text-tertiary)",
                }}
                onClick={() => setShowProfileEditModal(false)}
              >
                <X size={20} />
              </button>
            </div>

            {/* Kişisel Bilgiler */}
            <div style={{ marginBottom: "24px" }}>
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                  marginBottom: "16px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Kişisel Bilgiler
              </h4>

              <div className="profile-edit-grid">
                <div className="form-group">
                  <label className="form-label form-label-required">
                    Ad Soyad
                  </label>
                  <div className="input-with-icon">
                    <span className="input-icon">
                      <User size={16} />
                    </span>
                    <input
                      className="input"
                      type="text"
                      value={profileEditForm.name}
                      onChange={(e) =>
                        setProfileEditForm({
                          ...profileEditForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="Adınız Soyadınız"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label form-label-required">
                    E-posta
                  </label>
                  <div className="input-with-icon">
                    <span className="input-icon">
                      <Mail size={16} />
                    </span>
                    <input
                      className="input"
                      type="email"
                      value={profileEditForm.email}
                      onChange={(e) =>
                        setProfileEditForm({
                          ...profileEditForm,
                          email: e.target.value,
                        })
                      }
                      placeholder="ornek@email.com"
                    />
                  </div>
                </div>
              </div>

              <div className="profile-edit-grid full-width">
                <div className="form-group">
                  <label className="form-label">Telefon Numarası</label>
                  <div className="input-with-icon">
                    <span className="input-icon">
                      <Phone size={16} />
                    </span>
                    <input
                      className="input"
                      type="tel"
                      value={profileEditForm.phone}
                      onChange={(e) =>
                        setProfileEditForm({
                          ...profileEditForm,
                          phone: e.target.value,
                        })
                      }
                      placeholder="0500 000 00 00"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Şifre Değiştirme */}
            <div
              style={{
                marginBottom: "24px",
                paddingTop: "24px",
                borderTop: "1px solid var(--border-color)",
              }}
            >
              <h4
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "var(--text-primary)",
                  marginBottom: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Şifre Değiştir
              </h4>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  marginBottom: "16px",
                }}
              >
                Şifrenizi değiştirmek için aşağıdaki alanları doldurun.
                Değiştirmek istemiyorsanız boş bırakın.
              </p>

              <div className="profile-edit-grid full-width">
                <div className="form-group">
                  <label className="form-label">Mevcut Şifre</label>
                  <div className="input-with-icon">
                    <span className="input-icon">
                      <Lock size={16} />
                    </span>
                    <input
                      className="input"
                      type={showPassword.current ? "text" : "password"}
                      value={profileEditForm.currentPassword}
                      onChange={(e) =>
                        setProfileEditForm({
                          ...profileEditForm,
                          currentPassword: e.target.value,
                        })
                      }
                      placeholder="Mevcut şifreniz"
                    />
                    <button
                      className="password-toggle"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          current: !showPassword.current,
                        })
                      }
                    >
                      {showPassword.current ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="profile-edit-grid">
                <div className="form-group">
                  <label className="form-label">Yeni Şifre</label>
                  <div className="input-with-icon">
                    <span className="input-icon">
                      <Lock size={16} />
                    </span>
                    <input
                      className="input"
                      type={showPassword.new ? "text" : "password"}
                      value={profileEditForm.newPassword}
                      onChange={(e) =>
                        setProfileEditForm({
                          ...profileEditForm,
                          newPassword: e.target.value,
                        })
                      }
                      placeholder="Yeni şifreniz"
                    />
                    <button
                      className="password-toggle"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          new: !showPassword.new,
                        })
                      }
                    >
                      {showPassword.new ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Yeni Şifre (Tekrar)</label>
                  <div className="input-with-icon">
                    <span className="input-icon">
                      <Lock size={16} />
                    </span>
                    <input
                      className="input"
                      type={showPassword.confirm ? "text" : "password"}
                      value={profileEditForm.confirmPassword}
                      onChange={(e) =>
                        setProfileEditForm({
                          ...profileEditForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Yeni şifreniz (tekrar)"
                    />
                    <button
                      className="password-toggle"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          confirm: !showPassword.confirm,
                        })
                      }
                    >
                      {showPassword.confirm ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Butonlar */}
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => setShowProfileEditModal(false)}
              >
                İptal
              </button>
              <button
                className="btn"
                onClick={handleProfileUpdate}
                disabled={loading}
              >
                <Save size={16} />
                {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showExpenseModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3
              style={{
                fontSize: "20px",
                marginBottom: "24px",
                fontWeight: "700",
                color: "var(--text-primary)",
              }}
            >
              Yeni Gider Ekle
            </h3>
            <input
              className="input"
              placeholder="Gider Adı"
              value={expenseForm.name}
              onChange={(e) =>
                setExpenseForm({ ...expenseForm, name: e.target.value })
              }
            />
            <input
              className="input"
              type="number"
              placeholder="Tutar (₺)"
              value={expenseForm.amount}
              onChange={(e) =>
                setExpenseForm({ ...expenseForm, amount: e.target.value })
              }
            />
            <button
              className="btn"
              onClick={handleAddExpense}
              style={{ marginTop: "16px" }}
            >
              <Plus size={18} /> Kaydet
            </button>
            <button
              className="btn btn-secondary"
              style={{ marginTop: "12px" }}
              onClick={() => setShowExpenseModal(false)}
            >
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Dark Mode Toggle Button */}
      <button
        className="dark-mode-toggle"
        onClick={toggleDarkMode}
        data-tooltip={darkMode ? "Aydınlık Mod" : "Karanlık Mod"}
        data-tooltip-pos="left"
      >
        {darkMode ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
    </div>
  );
}
