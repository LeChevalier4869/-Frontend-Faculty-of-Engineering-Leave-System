import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
dayjs.extend(isSameOrBefore);

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { th } from "date-fns/locale";
import { apiEndpoints } from "../../utils/api";
import Swal from "sweetalert2";
import { XmarkIcon } from "@heroicons/react/24/outline";

function LeaveRequestModalAdmin({ isOpen, onClose, onSuccess }) {
    return (
        <div>
            This is LeaveRequestModalAdmin
        </div>
    );
};

export default LeaveRequestModalAdmin;