"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Account {
  id: number
  name: string
  points: number
  fees: number
  earning: number
}

interface DayData {
  date: string
  dayOfWeek: string
  isToday: boolean
  points: number
  fees: number
  airdrop: number
  earning: number
}

const generateDays = () => {
  const days = []
  const today = new Date()

  for (let i = 14; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    days.push({
      date: date.toLocaleDateString("vi-VN"),
      dayOfWeek: date.toLocaleDateString("vi-VN", { weekday: "long" }),
      isToday: i === 0,
      points: 0,
      fees: 0,
      airdrop: 0,
      earning: 0,
    })
  }

  return days
}

export default function AccountTracker() {
  const [accounts, setAccounts] = useState<Account[]>([
    { id: 1, name: "Tài khoản 1", points: 0, fees: 0, earning: 0 },
    { id: 2, name: "Tài khoản 2", points: 0, fees: 0, earning: 0 },
    { id: 3, name: "Tài khoản 3", points: 0, fees: 0, earning: 0 },
  ])
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null)
  const [accountDays, setAccountDays] = useState<Record<number, DayData[]>>({
    1: generateDays(),
    2: generateDays(),
    3: generateDays(),
  })

  useEffect(() => {
    const savedAccounts = localStorage.getItem("accounts")
    const savedAccountDays = localStorage.getItem("accountDays")

    if (savedAccounts) {
      setAccounts(JSON.parse(savedAccounts))
    }
    if (savedAccountDays) {
      setAccountDays(JSON.parse(savedAccountDays))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("accounts", JSON.stringify(accounts))
  }, [accounts])

  useEffect(() => {
    localStorage.setItem("accountDays", JSON.stringify(accountDays))
  }, [accountDays])

  useEffect(() => {
    setAccounts((prevAccounts) =>
      prevAccounts.map((account) => {
        const days = accountDays[account.id] || []

        const totalDayPoints = days.reduce((sum, day) => sum + (Number(day.points) || 0), 0)

        const totalAirdrop = days.reduce((sum, day) => sum + (Number(day.airdrop) || 0), 0)

        const calculatedPoints = totalDayPoints - totalAirdrop * 15

        const calculatedFees = days.reduce((sum, day) => sum + (Number(day.fees) || 0), 0)

        const accountEarnings = days.reduce((sum, day) => sum + (Number(day.earning) || 0), 0)

        return {
          ...account,
          points: isNaN(calculatedPoints) ? 0 : calculatedPoints,
          fees: isNaN(calculatedFees) ? 0 : calculatedFees,
          earning: isNaN(accountEarnings) ? 0 : accountEarnings,
        }
      }),
    )
  }, [accountDays])

  const updateAccount = (id: number, field: keyof Account, value: string) => {
    setAccounts(accounts.map((account) => (account.id === id ? { ...account, [field]: value } : account)))
  }

  const updateDayData = (
    accountId: number,
    dayIndex: number,
    field: "points" | "fees" | "airdrop" | "earning",
    value: number,
  ) => {
    setAccountDays((prev) => ({
      ...prev,
      [accountId]: prev[accountId].map((day, idx) => (idx === dayIndex ? { ...day, [field]: value } : day)),
    }))
  }

  const totalPoints = accounts.reduce((sum, acc) => sum + (Number(acc.points) || 0), 0)
  const totalFees = accounts.reduce((sum, acc) => sum + (Number(acc.fees) || 0), 0)
  const totalEarningsFromAirdrop = accounts.reduce((sum, account) => sum + (Number(account.earning) || 0), 0)

  const selectedAccountData = accounts.find((acc) => acc.id === selectedAccount)
  const days = selectedAccount ? accountDays[selectedAccount] : []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Quản Lý Tài Khoản</h1>
          <p className="text-gray-600">Theo dõi điểm số và phí của 3 tài khoản</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {accounts.map((account) => (
            <Card
              key={account.id}
              onClick={() => setSelectedAccount(account.id)}
              className={`shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                selectedAccount === account.id ? "ring-4 ring-blue-500" : ""
              }`}
            >
              <CardHeader className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                <CardTitle className="text-lg">{account.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <Label htmlFor={`name-${account.id}`} className="text-sm font-medium">
                    Tên tài khoản
                  </Label>
                  <Input
                    id={`name-${account.id}`}
                    value={account.name}
                    onChange={(e) => updateAccount(account.id, "name", e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1"
                    placeholder="Nhập tên"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Số điểm</Label>
                  <div className="mt-1 p-2 bg-gray-100 rounded-md text-lg font-semibold text-gray-700">
                    {isNaN(account.points) ? 0 : account.points}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Phí đã dùng</Label>
                  <div className="mt-1 p-2 bg-gray-100 rounded-md text-lg font-semibold text-gray-700">
                    {isNaN(account.fees) ? 0 : account.fees}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Tiền nhận</Label>
                  <div className="mt-1 p-2 bg-gray-100 rounded-md text-lg font-semibold text-gray-700">
                    {isNaN(account.earning) ? 0 : account.earning}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {selectedAccountData && (
          <Card className="shadow-lg mb-8 border-2 border-blue-500">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
              <CardTitle className="flex items-center justify-between">
                <span>Lịch 15 Ngày - {selectedAccountData.name}</span>
                <button
                  onClick={() => setSelectedAccount(null)}
                  className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded transition-colors"
                >
                  Đóng
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-2">
                {days.map((day, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                      day.isToday
                        ? "bg-blue-100 border-blue-500 shadow-md"
                        : "bg-white border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-center ${day.isToday ? "text-blue-600 font-bold" : "text-gray-700"}`}>
                        <div className="text-2xl font-bold">{index + 1}</div>
                        <div className="text-xs">Ngày</div>
                      </div>
                      <div>
                        <div className={`font-semibold ${day.isToday ? "text-blue-700" : "text-gray-900"}`}>
                          {day.date}
                        </div>
                        <div className="text-sm text-gray-600">{day.dayOfWeek}</div>
                      </div>
                    </div>
                    {day.isToday && (
                      <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">Hôm nay</span>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium whitespace-nowrap">Điểm:</Label>
                        <Select
                          value={day.points.toString()}
                          onValueChange={(value) => updateDayData(selectedAccount!, index, "points", Number(value))}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 22 }, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {i}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium whitespace-nowrap">Fee:</Label>
                        <Select
                          value={day.fees.toString()}
                          onValueChange={(value) => updateDayData(selectedAccount!, index, "fees", Number(value))}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 31 }, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {i}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium whitespace-nowrap">Airdrop:</Label>
                        <Select
                          value={day.airdrop.toString()}
                          onValueChange={(value) => updateDayData(selectedAccount!, index, "airdrop", Number(value))}
                        >
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 4 }, (_, i) => (
                              <SelectItem key={i} value={i.toString()}>
                                {i}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-medium whitespace-nowrap">Tiền nhận:</Label>
                        <Input
                          type="number"
                          min="0"
                          value={day.earning}
                          onChange={(e) =>
                            updateDayData(selectedAccount!, index, "earning", Number(e.target.value) || 0)
                          }
                          className="w-24"
                          placeholder="0"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
            <CardTitle>Tổng Kết</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Tổng số điểm</p>
                <p className="text-3xl font-bold text-blue-600">{isNaN(totalPoints) ? 0 : totalPoints}</p>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Tổng phí đã dùng</p>
                <p className="text-3xl font-bold text-indigo-600">{isNaN(totalFees) ? 0 : totalFees}</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Tổng tiền đã nhận</p>
                <p className="text-3xl font-bold text-green-600">
                  {isNaN(totalEarningsFromAirdrop) ? 0 : totalEarningsFromAirdrop}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
