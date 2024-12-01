// Verilated -*- C++ -*-
// DESCRIPTION: Verilator output: Tracing implementation internals
#include "verilated_vcd_c.h"
#include "Vsimple_module__Syms.h"


void Vsimple_module::traceChgTop0(void* userp, VerilatedVcd* tracep) {
    Vsimple_module__Syms* __restrict vlSymsp = static_cast<Vsimple_module__Syms*>(userp);
    Vsimple_module* const __restrict vlTOPp VL_ATTR_UNUSED = vlSymsp->TOPp;
    // Variables
    if (VL_UNLIKELY(!vlSymsp->__Vm_activity)) return;
    // Body
    {
        vlTOPp->traceChgSub0(userp, tracep);
    }
}

void Vsimple_module::traceChgSub0(void* userp, VerilatedVcd* tracep) {
    Vsimple_module__Syms* __restrict vlSymsp = static_cast<Vsimple_module__Syms*>(userp);
    Vsimple_module* const __restrict vlTOPp VL_ATTR_UNUSED = vlSymsp->TOPp;
    vluint32_t* const oldp = tracep->oldp(vlSymsp->__Vm_baseCode + 1);
    if (false && oldp) {}  // Prevent unused
    // Body
    {
        tracep->chgBit(oldp+0,(vlTOPp->clk));
        tracep->chgBit(oldp+1,(vlTOPp->reset));
        tracep->chgCData(oldp+2,(vlTOPp->a),8);
        tracep->chgCData(oldp+3,(vlTOPp->b),8);
        tracep->chgCData(oldp+4,(vlTOPp->sum),8);
    }
}

void Vsimple_module::traceCleanup(void* userp, VerilatedVcd* /*unused*/) {
    Vsimple_module__Syms* __restrict vlSymsp = static_cast<Vsimple_module__Syms*>(userp);
    Vsimple_module* const __restrict vlTOPp VL_ATTR_UNUSED = vlSymsp->TOPp;
    // Body
    {
        vlSymsp->__Vm_activity = false;
        vlTOPp->__Vm_traceActivity[0U] = 0U;
    }
}
