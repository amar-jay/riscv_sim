// Verilated -*- C++ -*-
// DESCRIPTION: Verilator output: Tracing implementation internals
#include "verilated_vcd_c.h"
#include "Vsimple_module__Syms.h"


//======================

void Vsimple_module::trace(VerilatedVcdC* tfp, int, int) {
    tfp->spTrace()->addInitCb(&traceInit, __VlSymsp);
    traceRegister(tfp->spTrace());
}

void Vsimple_module::traceInit(void* userp, VerilatedVcd* tracep, uint32_t code) {
    // Callback from tracep->open()
    Vsimple_module__Syms* __restrict vlSymsp = static_cast<Vsimple_module__Syms*>(userp);
    if (!Verilated::calcUnusedSigs()) {
        VL_FATAL_MT(__FILE__, __LINE__, __FILE__,
                        "Turning on wave traces requires Verilated::traceEverOn(true) call before time 0.");
    }
    vlSymsp->__Vm_baseCode = code;
    tracep->module(vlSymsp->name());
    tracep->scopeEscape(' ');
    Vsimple_module::traceInitTop(vlSymsp, tracep);
    tracep->scopeEscape('.');
}

//======================


void Vsimple_module::traceInitTop(void* userp, VerilatedVcd* tracep) {
    Vsimple_module__Syms* __restrict vlSymsp = static_cast<Vsimple_module__Syms*>(userp);
    Vsimple_module* const __restrict vlTOPp VL_ATTR_UNUSED = vlSymsp->TOPp;
    // Body
    {
        vlTOPp->traceInitSub0(userp, tracep);
    }
}

void Vsimple_module::traceInitSub0(void* userp, VerilatedVcd* tracep) {
    Vsimple_module__Syms* __restrict vlSymsp = static_cast<Vsimple_module__Syms*>(userp);
    Vsimple_module* const __restrict vlTOPp VL_ATTR_UNUSED = vlSymsp->TOPp;
    const int c = vlSymsp->__Vm_baseCode;
    if (false && tracep && c) {}  // Prevent unused
    // Body
    {
        tracep->declBit(c+1,"clk", false,-1);
        tracep->declBit(c+2,"reset", false,-1);
        tracep->declBus(c+3,"a", false,-1, 7,0);
        tracep->declBus(c+4,"b", false,-1, 7,0);
        tracep->declBus(c+5,"sum", false,-1, 7,0);
        tracep->declBit(c+1,"simple_module clk", false,-1);
        tracep->declBit(c+2,"simple_module reset", false,-1);
        tracep->declBus(c+3,"simple_module a", false,-1, 7,0);
        tracep->declBus(c+4,"simple_module b", false,-1, 7,0);
        tracep->declBus(c+5,"simple_module sum", false,-1, 7,0);
    }
}

void Vsimple_module::traceRegister(VerilatedVcd* tracep) {
    // Body
    {
        tracep->addFullCb(&traceFullTop0, __VlSymsp);
        tracep->addChgCb(&traceChgTop0, __VlSymsp);
        tracep->addCleanupCb(&traceCleanup, __VlSymsp);
    }
}

void Vsimple_module::traceFullTop0(void* userp, VerilatedVcd* tracep) {
    Vsimple_module__Syms* __restrict vlSymsp = static_cast<Vsimple_module__Syms*>(userp);
    Vsimple_module* const __restrict vlTOPp VL_ATTR_UNUSED = vlSymsp->TOPp;
    // Body
    {
        vlTOPp->traceFullSub0(userp, tracep);
    }
}

void Vsimple_module::traceFullSub0(void* userp, VerilatedVcd* tracep) {
    Vsimple_module__Syms* __restrict vlSymsp = static_cast<Vsimple_module__Syms*>(userp);
    Vsimple_module* const __restrict vlTOPp VL_ATTR_UNUSED = vlSymsp->TOPp;
    vluint32_t* const oldp = tracep->oldp(vlSymsp->__Vm_baseCode);
    if (false && oldp) {}  // Prevent unused
    // Body
    {
        tracep->fullBit(oldp+1,(vlTOPp->clk));
        tracep->fullBit(oldp+2,(vlTOPp->reset));
        tracep->fullCData(oldp+3,(vlTOPp->a),8);
        tracep->fullCData(oldp+4,(vlTOPp->b),8);
        tracep->fullCData(oldp+5,(vlTOPp->sum),8);
    }
}
